

const Loading = ({load}) => {
  return (
     load && (
      <div className=" left-0 right-0 z-50">
        <div className="relative h-2 w-full overflow-hidden bg-gray-200">
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-gray-300 via-green-400 to-pink-100 animate-[loadingBar_2s_linear_infinite] rounded-full" />
        </div>
      </div>
    )
  )
}

export default Loading