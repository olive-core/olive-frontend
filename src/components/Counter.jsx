
function Counter({ count, setCount }) {


    const handleClick = () => {
        setCount(count + 1);
    }

    return (
        <>
            <button onClick={handleClick}>click me</button>
            <p>clicked {count} {count > 1 ? "times" : "time"}</p>
        </>
    )
}

export default Counter;