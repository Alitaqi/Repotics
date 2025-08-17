// pages/Home.jsx
import { useSelector, useDispatch } from "react-redux";
import { increment, decrement, reset, addByAmount } from "../lib/redux/counterSlice";

export default function Home() {
  const count = useSelector((state) => state.counter.value); // read state
  const dispatch = useDispatch(); // send actions

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Counter: {count}</h1>
      <button onClick={() => dispatch(increment())}>➕ Increment</button>
      <button onClick={() => dispatch(decrement())}>➖ Decrement</button>
      <button onClick={() => dispatch(reset())}>🔄 Reset</button>
      <button onClick={() => dispatch(addByAmount(5))}>➕ Add 5</button>
    </div>
  );
}
