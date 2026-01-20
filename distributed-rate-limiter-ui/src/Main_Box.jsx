import { Table } from "react-bootstrap";
import apiKeys from "./mock/apiKeys";
import 'bootstrap-icons/font/bootstrap-icons.css';


function Main_Box() {
  return (
    <div className="mt-4">
      <div className="table-box">
        <div className="table-scroll">
          <Table hover borderless >
            <thead>
              <tr>
                <th className="text-white">API Key</th>
                <th className="text-white">Owner</th>
                <th className="text-white">Rate Limit</th>
                <th className="text-white">Window</th>
                <th className="text-white">Status</th>
              </tr>
            </thead>
            <tbody>
              {apiKeys.map((item) => (
                <tr key={item.apiKey}>
                  <td className="bg-transparent text-white">{item.apiKey}</td>
                  <td className="bg-transparent text-white">{item.owner}</td>
                  <td className="bg-transparent text-white">{item.rateLimit}</td>
                  <td className="bg-transparent text-white">{item.window}</td>
                  <td className="bg-transparent text-white">{item.status}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export default Main_Box;
