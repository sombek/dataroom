import sqlalchemy as db
from sqlalchemy.orm import Mapped, declarative_base, mapped_column

engine = db.create_engine("sqlite:///dataroom.db")
Base = declarative_base()


class CompanyFile(Base):
    __tablename__ = "company_files"

    id: Mapped[int] = mapped_column("Id", primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column("UserId")
    company_name: Mapped[str] = mapped_column("CompanyName")
    company_description: Mapped[str] = mapped_column("CompanyDescription")
    company_logo: Mapped[str] = mapped_column("CompanyLogo")


class CompanyContent(Base):
    __tablename__ = "company_content"

    id: Mapped[int] = mapped_column("Id", primary_key=True, autoincrement=True)
    document_name: Mapped[str] = mapped_column("DocumentName")
    file_name: Mapped[str] = mapped_column("FileName")
    file_id: Mapped[int] = mapped_column("FileId")
    content_url: Mapped[str] = mapped_column("ContentUrl")
    random_id: Mapped[str] = mapped_column("RandomId")


Base.metadata.create_all(engine)
