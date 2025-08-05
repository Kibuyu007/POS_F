const TableDash = () => {
  return (
    <div className="flex-[1] bg-secondary rounded-xl p-4 sm:p-6 shadow-md text-black overflow-y-auto max-h-[80vh] scrollbar-hide mt-6">
      <div className="relative flex flex-col min-w-0 break-words border border-dashed bg-clip-border rounded-2xl border-stone-400 bg-light/30">
        {/* card header */}
        <div className="px-9 pt-5 flex justify-between items-stretch flex-wrap min-h-[70px] pb-0 bg-transparent">
          <h3 className="flex flex-col items-start justify-center m-2 ml-0 font-medium text-xl/tight text-dark">
            <span className="mr-3 font-semibold text-dark">
              Projects Deliveries
            </span>
            <span className="mt-1 font-medium text-secondary-dark text-lg/normal">
              All projects from the Loopple team
            </span>
          </h3>
          <div className="relative flex flex-wrap items-center my-2">
            <button
              type="button"
              className="inline-block text-[.925rem] font-medium leading-normal text-center align-middle cursor-pointer rounded-2xl transition-colors duration-150 ease-in-out text-light-inverse bg-light-dark border-light shadow-none border-0 py-2 px-5 hover:bg-secondary active:bg-light focus:bg-light"
            >
              See other projects
            </button>
          </div>
        </div>
        {/* end card header */}

        {/* card body */}
        <div className="flex-auto block py-8 pt-6 px-9">
          <div className="overflow-x-auto">
            <table className="w-full my-0 align-middle text-dark border-neutral-200">
              <thead className="align-bottom">
                <tr className="font-semibold text-[0.95rem] text-secondary-dark">
                  <th className="pb-3 text-start min-w-[175px]">TASK</th>
                  <th className="pb-3 text-end min-w-[100px]">OWNER</th>
                  <th className="pb-3 text-end min-w-[100px]">PROGRESS</th>
                  <th className="pb-3 pr-12 text-end min-w-[175px]">STATUS</th>
                  <th className="pb-3 pr-12 text-end min-w-[100px]">
                    DEADLINE
                  </th>
                  <th className="pb-3 text-end min-w-[50px]">DETAILS</th>
                </tr>
              </thead>
              <tbody>
                {/* Your table rows go here — no changes needed except replacing href="javascript:void(0)" with "#" */}
                {/* Example row */}
                <tr className="border-b border-dashed last:border-b-0">
                  <td className="p-3 pl-0">
                    <div className="flex items-center">
                      <div className="relative inline-block shrink-0 rounded-2xl me-3">
                        <img
                          src="https://raw.githubusercontent.com/Loopple/loopple-public-assets/main/riva-dashboard-tailwind/img/img-49-new.jpg"
                          className="w-[50px] h-[50px] inline-block shrink-0 rounded-2xl"
                          alt="Project"
                        />
                      </div>
                      <div className="flex flex-col justify-start">
                        <a
                          href="#"
                          className="mb-1 font-semibold transition-colors duration-200 ease-in-out text-lg/normal text-secondary-inverse hover:text-primary"
                        >
                          Social Media API
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 pr-0 text-end">
                    <span className="font-semibold text-light-inverse text-md/normal">
                      Olivia Cambell
                    </span>
                  </td>
                  <td className="p-3 pr-0 text-end">
                    <span className="text-center align-baseline inline-flex px-2 py-1 mr-auto items-center font-semibold text-base/none text-success bg-success-light rounded-lg">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-5 h-5 mr-1"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                        />
                      </svg>{" "}
                      6.5%
                    </span>
                  </td>
                  <td className="p-3 pr-12 text-end">
                    <span className="text-center align-baseline inline-flex px-4 py-3 mr-auto items-center font-semibold text-[.95rem] leading-none text-primary bg-primary-light rounded-lg">
                      In Progress
                    </span>
                  </td>
                  <td className="pr-0 text-start">
                    <span className="font-semibold text-light-inverse text-md/normal">
                      2023-08-23
                    </span>
                  </td>
                  <td className="p-3 pr-0 text-end">
                    <button className="ml-auto relative text-secondary-dark bg-light-dark hover:text-primary flex items-center h-[25px] w-[25px] text-base font-medium leading-normal text-center align-middle cursor-pointer rounded-2xl transition-colors duration-200 ease-in-out shadow-none border-0 justify-center">
                      <span className="flex items-center justify-center p-0 m-0 leading-none shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8.25 4.5l7.5 7.5-7.5 7.5"
                          />
                        </svg>
                      </span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableDash;
