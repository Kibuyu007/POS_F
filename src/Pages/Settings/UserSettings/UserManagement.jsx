import { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import AddUser from "./AddUser";

const UserManagement = () => {
  const [users, setUsers] = useState([]);

  // Fetch data from API or use dummy data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://your-api-endpoint.com/users");
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setUsers([
          {
            id: 1,
            name: "Alice Johnson",
            title: "Software Engineer",
            email: "alice@example.com",
            phone: "+255 634 567 890",
            status: "Active",
          },
          {
            id: 2,
            name: "Michael Smith",
            title: "Product Manager",
            email: "michael@example.com",
            phone: "+255 787 654 321",
            status: "Inactive",
          },
          {
            id: 3,
            name: "Emma Williams",
            title: "UX Designer",
            email: "emma@example.com",
            phone: "+255 756 789 012",
            status: "Active",
          },
          {
            id: 3,
            name: "Emma Williams",
            title: "UX Designer",
            email: "emma@example.com",
            phone: "+255 756 789 012",
            status: "Active",
          },
          {
            id: 3,
            name: "Emma Williams",
            title: "UX Designer",
            email: "emma@example.com",
            phone: "+255 756 789 012",
            status: "Inactive",
          },
          {
            id: 3,
            name: "Emma Williams",
            title: "UX Designer",
            email: "emma@example.com",
            phone: "+255 756 789 012",
            status: "Inactive",
          },
          {
            id: 3,
            name: "Emma Williams",
            title: "UX Designer",
            email: "emma@example.com",
            phone: "+255 756 789 012",
            status: "Active",
          },
          {
            id: 3,
            name: "Emma Williams",
            title: "UX Designer",
            email: "emma@example.com",
            phone: "+255 756 789 012",
            status: "Active",
          },
          {
            id: 3,
            name: "Emma Williams",
            title: "UX Designer",
            email: "emma@example.com",
            phone: "+255 756 789 012",
            status: "Inactive",
          },
        ]);
      }
    };

    fetchData();
  }, []);


  // Modala
  const [showModalAdd, setShowModalAdd] = useState(false);
 

  return (
    <div className="sm:px-6 w-full">
      {/* Title */}
      <div className="px-4 md:px-10 py-4 md:py-7">
        <div className="flex items-center justify-between">
          <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">
            USERS
          </p>
        </div>
      </div>

      <div className="sm:flex items-center justify-between ml-9">
        <div className="flex items-center">
          <a
            className="rounded-full focus:outline-none focus:ring-2  focus:bg-indigo-50 focus:ring-indigo-800"
            href=" javascript:void(0)"
          >
            <div className="py-2 px-8 bg-green-300 text-black rounded-full border-y-gray-400">
              <p>All</p>
            </div>
          </a>
          <a
            className="rounded-full focus:outline-none bg-gray-200 shadow-sm focus:ring-2 focus:bg-indigo-50 focus:ring-green-300 ml-4 sm:ml-8"
            href="javascript:void(0) border-y-gray-400"
          >
            <div className="py-2 px-8 text-gray-600 hover:text-black hover:bg-indigo-100 rounded-full border-y-gray-400">
              <p>Active</p>
            </div>
          </a>
          <a
            className="rounded-full bg-gray-200 shadow-sm  focus:outline-none focus:ring-2 focus:bg-indigo-50 focus:ring-green-300 ml-4 sm:ml-8"
            href="javascript:void(0)"
          >
            <div className="py-2 px-8 text-gray-600 hover:text-black hover:bg-indigo-100 rounded-full ">
              <p>Inactive</p>
            </div>
          </a>
        </div>

        {/* Search Bar */}
        <div className="hidden sm:flex items-center bg-gray-100 rounded-[30px] px-3 sm:px-4 py-1 sm:py-2 w-full max-w-[300px] border border-gray-400">
          <FaSearch className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-black" />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent outline-none px-2 py-1 w-full text-black"
          />
        </div>

        <button onClick={() => setShowModalAdd(true)} className="mr-10 focus:ring-2 focus:ring-offset-2  mt-4 sm:mt-0 inline-flex items-start justify-start px-6 py-3 bg-green-300 hover:bg-gray-200 focus:outline-none rounded">
          <p className="text-sm font-medium leading-none text-black">
            + Add User
          </p>
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white py-4 md:py-7 px-4 md:px-8 xl:px-10">
        <div className="mt-7 overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-gray-200 text-black">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Name
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Title
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Email
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Phone Number
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  Active Status
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Action
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  User Status
                </th>
              </tr>
            </thead>

            <tr className="h-3" />

            <tbody>
              {users.map((user) => (
                <>
                  <tr
                    key={user.id}
                    className="focus:outline-none h-16 border-gray-500 shadow-md bg-gray-100"
                  >
                    <td className="pl-4 bg-gray-200">
                      <div className="flex items-center">
                        <p className="text-sm leading-none text-gray-600 ml-2">
                          {user.name}
                        </p>
                      </div>
                    </td>

                    <td className="pl-5">
                      <p className="text-sm leading-none text-gray-600">
                        {user.title}
                      </p>
                    </td>

                    <td className="pl-5 bg-gray-200">
                      <p className="text-sm leading-none text-gray-600">
                        {user.email}
                      </p>
                    </td>

                    <td className="pl-5 bg-gray-200">
                      <p className="text-sm leading-none text-gray-600">
                        {user.phone}
                      </p>
                    </td>

                    <td className="pl-5">
                      <span
                        className={`py-3 px-3 text-sm leading-none ${
                          user.status === "Active"
                            ? "text-green-700 bg-green-100"
                            : "text-red-700 bg-red-100"
                        } rounded`}
                      >
                        {user.status}
                      </span>
                    </td>

                    <td className="pl-4 gap-2 bg-gray-200">
                      <button className="focus:ring-1 focus:ring-offset-2 focus:ring-blue-300 text-sm leading-none text-gray-600 py-3 px-5 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none">
                        Edit
                      </button>
                    </td>

                    <td>
                      <button className="focus:ring-1 focus:ring-offset-2 focus:ring-red-300 text-sm leading-none text-gray-600 py-3 px-5 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none">
                        Deactivate
                      </button>
                    </td>
                  </tr>
                  <tr className="h-4" />
                </>
              ))}
            </tbody>
          </table>

          <AddUser
          showModal={showModalAdd}
          setShowModal={setShowModalAdd}
        />
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
