export default function AboutUs() {
  return (
    <>
      <h1 className="text-5xl font-bold text-center mt-5 mb-10">About us</h1>
      <div className="flex flex-col items-center w-[85%] rounded-lg shadow-md bg-gray-100 mx-auto p-5">
        <span
          className="mb-8 mt-10 text-gray-600 text-lg"
          style={{ fontWeight: 300 }}
        >
          This is our team, we are students of EPITECH in 3rd year.
        </span>

        <div className="mb-10 rounded-lg shadow-sm bg-gray-300 p-5 w-[65%] flex flex-wrap gap-10 justify-center items-center">
          <div className="flex flex-col items-center text-center">
            <img
              src="https://avatars.githubusercontent.com/u/109749395?v=4&size=150"
              alt="Image de profil de Lou Onezime"
              width="150"
              height="150"
              className="mb-4"
            />
            <span className="text-gray-600 text-xl font-bold">Lou</span>
            <span className="text-gray-600 font-normal">Q&A Specialist</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <img
              src="https://avatars.githubusercontent.com/u/100275038?v=4&size=150"
              alt="Image de profil d'Alexandre"
              width="150"
              height="150"
              className="mb-4"
            />
            <span className="text-gray-600 text-xl font-bold">Alexandre</span>
            <span className="text-gray-600 font-normal">Product Owner</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <img
              src="https://avatars.githubusercontent.com/u/114922714?v=4&size=150"
              alt="Image de profil de Johana"
              width="150"
              height="150"
              className="mb-4"
            />
            <span className="text-gray-600 text-xl font-bold">Johana</span>
            <span className="text-gray-600 font-normal">Q&A Specialist</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <img
              src="https://avatars.githubusercontent.com/u/101752802?v=4&size=150"
              alt="Image de profil d'Adam"
              width="150"
              height="150"
              className="mb-4"
            />
            <span className="text-gray-600 text-xl font-bold">Adam</span>
            <span className="text-gray-600 font-normal">Q&A Specialist</span>
          </div>
        </div>
      </div>
    </>
  );
}
