import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateTableOrder } from '../../Redux/customerOrderSlice';

const TableCard = ({ index, status,name,initial }) => {
    const navigate = useNavigate();

    const dispatch = useDispatch()

    // Define colors based on the table status
    let statusColor = "";
    let statusText = "";

    switch (status) {
        case "booked":
            statusColor = "bg-green-500";
            statusText = "Booked";
            break;
        case "available":
            statusColor = "bg-yellow-500";
            statusText = "Available";
            break;
        case "closed":
            statusColor = "bg-red-500";
            statusText = "Not In Use";
            break;
        default:
            statusColor = "bg-gray-500";
            statusText = "Unknown";
            break;
    }

    // Click to Menu List function
    const handleMenu = (name) => {
        if (status === "booked") {
            alert("This table is already booked!");
            return;
        }
        if (status === "closed") {
            alert("This table is not in use!");
            return;
        }

        dispatch(updateTableOrder({tableName: name}))
        navigate(`/menu?table=${index}`);
    };

    return (
        <div
        onClick={() => handleMenu(name)}
            className="bg-black p-6 rounded-lg w-full max-w-lg mx-auto md:max-w-xl lg:max-w-2xl xl:max-w-3xl cursor-pointer"
        >
            <div className="flex flex-col sm:flex-row items-center gap-5 mb-3">
                <p className="text-[#ababab] text-sm">{name} {index}</p>
                <div className="flex flex-col sm:flex-row justify-between w-full gap-4">
                    <div className="flex flex-col items-start gap-1 bg-lightGreen py-2 px-4 rounded-md">
                        <h1 className="text-[#f5f5f5] text-lg font-semibold tracking-wide">
                            {initial}
                        </h1>
                    </div>
                    <div className="flex flex-col sm:items-end gap-2">
                        <p className={`text-black py-1 px-3 text-sm flex items-center ${statusColor} rounded-md`}>
                            {statusText}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mt-4 text-[#ababab] text-sm sm:text-base">
                <p>Booked Time</p>
                <p>January 18, 2025 08:32 PM</p>
            </div>
            <div className="flex justify-between items-center mt-4 text-[#ababab] text-sm sm:text-base">
                <p>Available Seats: 3</p>
            </div>

            <hr className="w-full mt-4 border-t border-gray-500" />

            <div className="flex justify-between items-center mt-4">
                <h1 className="text-white text-lg font-bold">Total</h1>
                <p className="text-[#f5f5f5] text-lg font-semibold">$250.00</p>
            </div>
        </div>
    );
};

export default TableCard;
