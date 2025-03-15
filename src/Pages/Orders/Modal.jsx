const Modal = ({ title, closeModal, openModal, children }) => {
  if (!openModal) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#878787] bg-opacity-40 z-50">
      <div className="bg-white shadow-lg w-full max-w-lg mx-4 rounded-lg p-4">
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#333]">
          <h2 className="text-xl text-black font-semibold">{title}</h2>
          <button className="text-white text-2xl hover:text-gray-300 bg-slate-500 px-4 rounded-full" onClick={closeModal}>
            &times;
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
