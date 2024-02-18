
const AddHostBtn = (props) => {
    const { handleAdd } = props
    return (
        <button
            // onClick={() => {
            //     setMonitorIsVisible(!monitorIsVisible);
            //   }}
            onClick={handleAdd}
            className="text-white dark:text-gray-800 bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none mobile:w-max
            focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center ml-2 md:mr-0 dark:bg-green-400 dark:hover:bg-green-500 dark:focus:ring-green-800 flex mobile:inline items-center"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
            </svg>
            Add new host
        </button>
    )
}

export default AddHostBtn