import { sections } from '../ManageFolders.tsx';
import { Progress } from 'flowbite-react';

function randomIntFromInterval(number: number, number2: number) {
  return Math.floor(Math.random() * (number2 - number + 1) + number);
}

export const CompanyRequirementsProgress = () => {
  return (
    <>
      <h1 className={'text-3xl font-semibold text-gray-900 dark:text-white mb-4'}>Company Requirements Progress</h1>

      {sections.map((section, index) => {
        return (
          <div key={index}>
            <h2>{section.title}</h2>
            <Progress progress={randomIntFromInterval(0, 100)} />
          </div>
        );
      })}
    </>
  );
};
