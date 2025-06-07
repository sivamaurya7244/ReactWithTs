import React, { useState } from "react";

interface IProps {
  name: string;
  title: string;
}

interface CustomerProps {
  name: string;
  title?: string;
  age?: number;
}
let Customer: React.FC<CustomerProps> = ({ name, title, age }) => {
  
  const [state, setState] = useState<IProps>({ name: "siva", title: "Developer" });
  return (
    <>
     <div className="text-center">
       <h1 className='bg-success text-center text-white p-3'>
        Functional Component
      </h1>
      <div className='border px-4 bg-light mb-4'>
        <h3>
          name: <b>{name}</b><br />
          title: <b>{title}</b><br />
          age: {age && <b>{age}</b>}<br />
          <br />
        </h3>

      </div>
      <div className="col-md-4 card">
        <h1>Values from state</h1>
        <h4>Name: {state.name}</h4>
        <h4>Title: {state.title}</h4>
      </div>
     </div>

    </>);
};
export default Customer;