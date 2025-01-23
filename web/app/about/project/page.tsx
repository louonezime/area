const ProjectInfos = [
  "The goal of this project is to discover, as a whole, the software platform that we have chosen through the creation of a business application.",
  "To do this, we implemented a software suite that functions similar to that of IFTTT and/or Zapier.",
  "This software suite is broken into three parts :",
  "✓ An application server",
  "✓ A web client to use the application from your browser by querying the application server",
  "✓ A mobile client to use the application from your phone by querying the application server",
];

export default function AboutThisProject() {
  return (
    <>
      <h1 className="items-center text-5xl ml-[40%] mt-5 mb-16 font-bold font-[font-avenir-next]">
        About this project
      </h1>
      <div className="flex flex-col items-center justify-center w-[85%] h-128 rounded-lg shadow-md ml-[160px] mr-5 bg-gray-100">
        <span
          className="mb-12 mt-12 text-gray-600 text-lg"
          style={{ fontWeight: 300 }}
        >
          {ProjectInfos.map((line, lineIndex) => (
            <span key={lineIndex} className="justify-center items-center flex">
              {line}
              <br />
            </span>
          ))}
        </span>
      </div>
    </>
  );
}
