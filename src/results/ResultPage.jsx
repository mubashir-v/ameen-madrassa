import { useEffect, useState } from "react";
import Select from "react-select";
const API_KEY = import.meta.env.VITE_GOOGLEAPIKEY;

const classOptions = [
  { value: "STD 1", label: "STD 1" },
  { value: "STD 2", label: "STD 2" },
  { value: "STD 3", label: "STD 3" },
  { value: "STD 4", label: "STD 4" },
  { value: "STD 6", label: "STD 6" },
  { value: "STD 9", label: "STD 9" },
];

const sheetIds = {
  "STD 1": "1SrX7WH2uACDgkr4c56Wvhn5HTPpj6VOV9zpy8j_UJJs",
  "STD 2": "1YbjN9Ib5NEJKztNwnXqvrRdp5-P15Y9IpLRrqJQKLPw",
  "STD 3": "1Cpvtlgf-bLb8qL0aN9chMiFavXmZ1km8avj61zb1h4w",
  "STD 4": "1oHCQtwdDJ7E_HqvqA42PRZtL52ty6PTeaCpKl3XmOp4",
  "STD 6": "1x4aoTQHilXdKN9lvJO2Gmx_GLTBK9d9miRgibqPwv5c",
  "STD 9": "1djB6kghDjlDYGmt8qgDsPxmtAJuyouHtC9k6kM3jFuI",
};
import madrassaLogo from "../assets/madrassaLogo.png";
const excludedFields = ["Timestamp", "Student Name", "PASSED"];

function GoogleSheetData() {
  const [students, setStudents] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [studentOptions, setStudentOptions] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filteredStudent, setFilteredStudent] = useState(null);
  const [totalObtained, setTotalObtained] = useState(0);
  const [totalPossible, setTotalPossible] = useState(0);
  const [resultLoading, setResultLoading] = useState(false);
  const [studentLoading, setStudentLoading] = useState(false);
  useEffect(() => {
    if (!selectedClass) return;

    const fetchData = async () => {
      const SHEET_ID = sheetIds[selectedClass.value];
      const RANGE = "Form Responses 1";

      try {
        setStudentLoading(true);
        const response = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`
        );
        const result = await response.json();

        if (result.values && result.values.length > 1) {
          setHeaders(result.values[0]); // First row as headers
          const rows = result.values.slice(1); // Remaining rows as student data

          const formattedData = rows.map((row) =>
            Object.fromEntries(
              result.values[0].map((header, index) => [
                header.trim(),
                row[index] || "",
              ])
            )
          );

          setStudents(formattedData);
          console.log(formattedData);

          // Extract Student Name options
          const studentNames = formattedData
            .filter((student) => student["Student Name"]) // Use the exact key from your data
            .map((student) => ({
              value: student["Student Name"], // Use the exact key
              label: student["Student Name"],
            }));
          console.log(studentNames);

          setStudentOptions(studentNames);
          setSelectedStudent(null);

          setStudentLoading(false);
        }
      } catch (error) {
        console.error("Error fetching Google Sheet data:", error);
      }
    };

    fetchData();
  }, [selectedClass]);

  const handleSearch = () => {
    if (!selectedStudent) return;

    setResultLoading(true);

    const filtered = students.find(
      (student) => student["Student Name"] === selectedStudent.value
    );

    setFilteredStudent(filtered || null);
    const totalMarks = Object.entries(filtered).filter(
      ([key, value]) => !excludedFields.includes(key) && !isNaN(value)
    );

    setTotalObtained(
      totalMarks.reduce((sum, [_, value]) => sum + Number(value), 0)
    );
    setTotalPossible(totalMarks.length * 100);

    // Add a 2-second delay before setting result loading to false
    setTimeout(() => {
      setResultLoading(false);
    }, 2000);
  };

  const handleClassChange = (selectedOption) => {
    setSelectedClass(selectedOption);
    setStudents([]);
    setStudentOptions([]);
    setFilteredStudent(null);
  };

  return (
    <div className="flex flex-col h-screen w-screen ">
      <div className="flex h-24 border w-full bg-green-200">
        <div className="flex  md:flex-row  md:gap-8 gap-2 w-full h-full p-2 items-center justify-center">
          <img className="h-24" src={madrassaLogo} />
          <p className="text-gray-500 text-lg font-bold">
            MUNAWWIRUL ISLAM MADRASSA AREKERE
          </p>
        </div>
      </div>
      <div className="flex w-full h-full items-center justify-center bg-gray-100">
        <div className="flex md:w-1/2 w-full h-[90%] p-3 md:items-center justify-center">
          {!filteredStudent ? (
            <div className="flex bg-white flex-col border w-full md:w-2/3 h-1/2 p-4 rounded-lg shadow-md items-center justify-center">
              <form className="space-y-4 md:space-y-6">
                <div className="h-12 p-0 m-0 max-w-sm min-w-[70px]">
                  <Select
                    options={classOptions}
                    value={selectedClass}
                    onChange={handleClassChange}
                    placeholder="Select Class"
                    menuPosition="fixed"
                    components={{
                      DropdownIndicator: () => null,
                      IndicatorSeparator: () => null,
                    }}
                  />
                </div>
                {studentLoading ? (
                  <p className="flex justify-center items-center w-full animate-pulse text-gray-500 text-xs">
                    Fetching Students ...{" "}
                  </p>
                ) : (
                    <p className="flex justify-center items-center w-full text-gray-500 text-xs">
                    Select Class and Student
                  </p>
                )}
                <div className="h-12 p-0 m-0 max-w-sm min-w-[70px]">
                  <Select
                    options={studentOptions}
                    value={selectedStudent}
                    onChange={setSelectedStudent}
                    placeholder="Select Student"
                    menuPosition="fixed"
                    components={{
                      DropdownIndicator: () => null,
                      IndicatorSeparator: () => null,
                    }}
                    isDisabled={!selectedClass && !studentLoading}
                  />
                </div>
               
                <button
                  type="submit"
                  className="w-full text-white bg-green-800 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-2 py-2.5 text-center"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSearch();
                  }}
                >
                  Get Result
                </button>
              </form>
            </div>
          ) : resultLoading ? (
            <div className="flex flex-col bg-white items-center justify-center rounded-lg animate-pulse h-1/2 w-full md:w-2/3 border ">
              <img src={madrassaLogo} />
              <p className="text-gray text-sm">Fetching Result ...</p>
            </div>
          ) : (
            <div className="flex flex-col bg-white w-full border shadow-md rounded-lg">
              <div className="flex h-24 border w-full py-3 px-8 justify-center items-center bg-green-200">
                <img className="h-24" src={madrassaLogo} />
                <p className="text-gray-500 text-lg font-bold">
                  MUNAWWIRUL ISLAM MADRASSA AREKERE
                </p>
              </div>
              <div className="flex-1 w-full overflow-auto p-8 bg-blue-100">
                <div className="border shadow-sm bg-white rounded-lg">
                  <div className="flex h-20 border-b w-full p-2 items-center justify-center">
                    <div className="flex gap-2 h-full w-1/2 p-3 items-center justify-center">
                      <p className="text-sm text-gray-500 font-bold">Name :</p>
                      <p className="text-sm">
                        {filteredStudent["Student Name"]}
                      </p>
                    </div>
                    <div className="flex gap-2 h-full w-1/2 p-3 items-center justify-center">
                      <p className="text-sm text-gray-500 font-bold">STD :</p>
                      <p className="text-sm">{selectedClass.value}</p>
                    </div>
                  </div>
                  {Object.entries(filteredStudent).map(
                    ([key, value]) =>
                      !excludedFields.includes(key) &&
                      value && (
                        <div
                          key={key}
                          className="flex h-8 md:h-10 border-b w-full"
                        >
                          <div className="flex items-center px-4 text-gray-500 text-xs w-2/3 border-r">
                            {key}
                          </div>
                          <div className="flex items-center px-4 text-gray-500 text-xs w-1/3">
                            {`${value} / 100`}
                          </div>
                        </div>
                      )
                  )}

                  <div className="flex h-8 md:h-10 border-t w-full font-bold">
                    <div className="flex items-center px-4 text-gray-500 text-xs w-2/3 border-r">
                      Total
                    </div>
                    <div className="flex items-center px-4 text-gray-500 text-xs w-1/3">
                      {`${totalObtained} / ${totalPossible}`}
                    </div>
                  </div>
                  {filteredStudent["PASSED"] == "PASS" ? (
                    <div className="flex h-8 md:h-10 border-t bg-green-200 rounded-b-lg w-full font-bold">
                      <div className="flex items-center justify-center px-4 text-gray-500 text-xs w-full border-r">
                        PASSED
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-8 md:h-10 border-t w-full bg-red-200 rounded-b-lg  font-bold">
                      <div className="flex items-center justify-center px-4 text-gray-500 text-xs w-full border-r">
                        FAILED
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex w-full h-14 border pb-4 items-center bg-blue-100 justify-center">
                    <div onClick={()=>setFilteredStudent(null)} className="flex bg-blue-400 rounded-xl w-1/2 h-full items-center justify-center">
                    <p className="text-white text-sm font-bold">Go Back</p>
                    </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GoogleSheetData;
