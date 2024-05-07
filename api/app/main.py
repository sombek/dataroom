import mimetypes
import os
from typing import Annotated

import boto3
import uvicorn
from fastapi import Depends, FastAPI, Form, HTTPException, Query, UploadFile
from sqlalchemy.orm import create_session
from starlette.middleware.cors import CORSMiddleware
from starlette.requests import Request

from api.app.auth import JWTBearer
from api.app.database import CompanyContent, CompanyFile, engine

app = FastAPI()
s3_client = boto3.client(
    "s3",
    endpoint_url="http://localhost:9090/bucket1",
    aws_access_key_id="ACCESS_KEY",
    aws_secret_access_key="SECRET_KEY",
    aws_session_token="SESSION_TOKEN",
)


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/get-company-files")
async def get_company_files(
    document: str = Query(...),
    company_id: str = Query(...),
    user: dict = Depends(JWTBearer()),
):
    session = create_session(
        bind=engine,
        autocommit=False,
    )
    # check if company exists
    company = (
        session.query(CompanyFile)
        .filter(
            CompanyFile.user_id == user["sub"],
            CompanyFile.id == company_id,
        )
        .first()
    )
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    # get files
    files = (
        session.query(CompanyContent)
        .filter(
            CompanyContent.file_id == company_id,
            CompanyContent.document_name == document,
        )
        .all()
    )
    session.close()
    # add mime_type to files
    for file in files:
        file.mime_type = mimetypes.guess_type(file.file_name)[0] or "binary/octet-stream"
    return files


@app.post("/upload")
async def upload_file(
    file: Annotated[UploadFile, Form],
    document: str = Form(...),
    company_id: str = Form(...),
    user: dict = Depends(JWTBearer()),
):
    session = create_session(
        bind=engine,
        autocommit=False,
    )
    # check if company exists
    company = (
        session.query(CompanyFile)
        .filter(
            CompanyFile.user_id == user["sub"],
            CompanyFile.id == company_id,
        )
        .first()
    )
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    # create file
    print(file, document, company_id)
    content = []
    # upload files to s3
    file_name = file.filename.replace(" ", "_")
    file_mime = mimetypes.guess_type(file_name)[0] or "binary/octet-stream"
    if file_mime is None:
        raise Exception("Failed to guess mimetype")
    # write to local file
    with open(file_name, "wb") as f:
        f.write(file.file.read())

    s3_client.upload_file(
        file_name,
        f"company-files-{company_id}",
        document + "/" + file_name,
        ExtraArgs={
            "ContentType": file_mime,
        },
    )
    # delete the file after uploading
    os.remove(file_name)
    random_id_file = os.urandom(16).hex()
    content.append(
        CompanyContent(
            file_id=company_id,
            document_name=document,
            file_name=file_name,
            content_url=f"http://localhost:9090/bucket1/company-files-{company_id}/{document}/{file_name}",
            random_id=random_id_file,
        )
    )

    session.add_all(content)
    session.commit()
    session.close()
    return random_id_file


@app.delete("/reverse-upload")
async def main(
    request: Request,
    user: dict = Depends(JWTBearer()),
):
    random_id_file = await request.body()
    random_id_file = random_id_file.decode("utf-8").replace('"', "")
    session = create_session(
        bind=engine,
        autocommit=False,
    )
    # check if file related to user exists
    user_companies = session.query(CompanyFile).filter(CompanyFile.user_id == user["sub"]).all()
    file = (
        session.query(CompanyContent)
        .filter(
            CompanyContent.random_id == random_id_file,
            CompanyContent.file_id.in_(company.id for company in user_companies),
        )
        .first()
    )

    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    s3_client.delete_object(
        Bucket=f"company-files-{file.file_id}",
        Key=f"{file.document_name}/{file.file_name}",
    )
    session.delete(file)
    session.commit()
    session.close()

    return await get_company_files(file.document_name, file.file_id, user)
    # return {"message": "File deleted successfully", "file": file}


@app.get("/get-files")
async def say_hello(user: dict = Depends(JWTBearer())):
    session = create_session(
        bind=engine,
        autocommit=False,
    )
    files = session.query(CompanyFile).filter(CompanyFile.user_id == user["sub"]).all()
    session.close()
    return files


@app.get("/get-file/{file_id}")
async def get_file(file_id: int, user: dict = Depends(JWTBearer())):
    session = create_session(
        bind=engine,
        autocommit=False,
    )
    file = (
        session.query(CompanyFile)
        .filter(
            CompanyFile.user_id == user["sub"],
            CompanyFile.id == file_id,
        )
        .first()
    )
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    file_content = session.query(CompanyContent).filter(CompanyContent.file_id == file_id).all()
    session.close()
    return {
        "file": file,
        "content": file_content,
    }


@app.post("/upload-content/{file_id}")
async def upload_content(
    file_id: int,
    files: Annotated[
        list[UploadFile],
        Form,
    ],
    user: dict = Depends(JWTBearer()),
):
    content = []
    # upload files to s3
    for file in files:
        file_name = file.filename.replace(" ", "_")
        s3_client.upload_fileobj(
            file.file,
            "company-files",
            file_name,
        )
        content.append(
            CompanyContent(
                file_id=file_id,
                content_url=f"http://localhost:9090/bucket1/company-files/{file_name}",
            )
        )

    session = create_session(
        bind=engine,
        autocommit=False,
    )
    session.add_all(content)
    session.commit()
    session.close()
    return content


@app.post("/create-file")
async def create_file(
    company_name: Annotated[str, Form()],
    company_description: Annotated[str, Form()],
    company_logo: Annotated[UploadFile, Form],
    user: dict = Depends(JWTBearer()),
):
    print(company_name, company_description, company_logo)
    session = create_session(
        bind=engine,
        autocommit=False,
    )
    s3_client.upload_fileobj(
        company_logo.file,
        "company-logos",
        company_logo.filename,
        {"ContentType": "image/png"},
    )
    company_logo_url = f"http://localhost:9090/bucket1/company-logos/{company_logo.filename}"

    session.add(
        CompanyFile(
            user_id=user["sub"],
            company_name=company_name,
            company_description=company_description,
            company_logo=company_logo_url,
        )
    )
    session.commit()
    session.close()

    return {"message": "File created successfully"}


# cors
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    uvicorn.run(
        "api.app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
