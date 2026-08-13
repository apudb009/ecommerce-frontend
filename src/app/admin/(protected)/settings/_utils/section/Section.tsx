import { FC } from 'react';

type Props = { title: string; children: React.ReactNode };
const Section: FC<Props> = ({ title, children }) => {
  return (
    <div className="rounded-lg border bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">{title}</h3>
      {children}
    </div>
  );
};

export default Section;
