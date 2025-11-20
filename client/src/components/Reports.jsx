import { useEffect, useState } from "react";
import axios from "axios";

export default function Reports(){
  const today = new Date();
  const [month,setMonth] = useState(today.getMonth());
  const [year,setYear] = useState(today.getFullYear());
  const [rows,setRows] = useState([]);

  const fetch = async ()=> {
    const r = await axiosInstance.get(`/reports/monthly?month=${month}&year=${year}`, { withCredentials: true });
    setRows(r.data.rows);
  };
  useEffect(()=>{ fetch(); }, [month, year]);

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">Reports</h2>
      <div className="mb-4 flex gap-2">
        <select value={month} onChange={e=>setMonth(Number(e.target.value))} className="border px-3 py-2 rounded">
          {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m,i)=> <option key={i} value={i}>{m}</option>)}
        </select>
        <input type="number" value={year} onChange={e=>setYear(Number(e.target.value))} className="border px-3 py-2 rounded w-28" />
        <button onClick={fetch} className="px-3 py-2 border rounded">Refresh</button>
      </div>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr><th className="p-2">Category</th><th>Budget</th><th>Spent</th><th>Remaining</th></tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.categoryId} className={r.remaining < 0 ? "bg-red-50" : ""}>
              <td className="p-2">{r.name}</td>
              <td className="p-2">₹{r.budget}</td>
              <td className="p-2">₹{r.spent}</td>
              <td className="p-2">{r.remaining < 0 ? <span className="text-red-600">₹{r.remaining}</span> : `₹${r.remaining}`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
