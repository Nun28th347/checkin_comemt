document.addEventListener('DOMContentLoaded', async () => {
    await loadCheckinHistory(); // เรียกฟังก์ชันเพื่อโหลดข้อมูลทั้งหมดเมื่อหน้าเพจโหลดเสร็จ

    /* serch */
    const searchButton = document.getElementById('search-button');
    searchButton.addEventListener('click', filterHistoryByIdAndDate);  // เรียกฟังก์ชันค้นหาเมื่อคลิก

    // Event listener สำหรับปุ่ม Refresh
    const refreshButton = document.getElementById('refresh-button');
    refreshButton.addEventListener('click', refreshCheckinHistory);

    //Event listener สำหรับปุ่มดาวน์โหลด CSV
    const downloadButton = document.getElementById('download-csv-button');
    downloadButton.addEventListener('click', downloadCSV);
});



// checkin-history.js
async function fetchCheckinHistory() {
    try {
      // ขอข้อมูล check-in จากเซิร์ฟเวอร์
      const response = await fetch('/checkin-history');
      const data = await response.json();
  
      // ถ้าเป็น teacher จะแสดงข้อมูลทั้งหมด
      if (data.role === 'teacher') {
        renderCheckinHistory(data.history);  // แสดงข้อมูลทั้งหมด
      } 
      // ถ้าเป็น student จะแสดงเฉพาะข้อมูลของตัวเอง
      else if (data.role === 'student') {
        const studentHistory = data.history.filter(entry => entry.student_id === data.user_id);
        renderCheckinHistory(studentHistory);  // แสดงข้อมูลเฉพาะของตัวเอง
      }
    } catch (error) {
      console.error('Error fetching checkin history:', error);
    }
  }
  
  // ฟังก์ชันสำหรับแสดงข้อมูลในหน้า
  function renderCheckinHistory(history) {
    const historyContainer = document.getElementById('historyContainer');
    history.forEach(entry => {
      const div = document.createElement('div');
      div.textContent = `ID: ${entry.student_id}, Time: ${entry.checkin_time}`;
      historyContainer.appendChild(div);
    });
  }
  
  fetchCheckinHistory();  // เรียกฟังก์ชันเพื่อดึงข้อมูล check-in เมื่อโหลดหน้า
  






async function loadCheckinHistory() {
    try {
        const response = await fetch(`/api/checkin-history`);  // ดึงข้อมูลจาก API ที่เราแก้ไข
        if (!response.ok) {
            throw new Error('Failed to load check-in history');
        }
        const checkinHistory = await response.json();  // รับข้อมูลในรูปแบบ JSON
        const tableBody = document.getElementById('checkin-history-table').querySelector('tbody');
        
        checkinHistory.forEach(record => {
            const row = document.createElement('tr');
            
            // แสดง Student ID
            const studentIdCell = document.createElement('td');
            studentIdCell.textContent = record.student_id;
            row.appendChild(studentIdCell);
            
            // แสดง Date ในรูปแบบ YYYY-MM-DD HH:mm:ss
            const dateCell = document.createElement('td');
            dateCell.textContent = formatDate(record.active_date); // เรียกใช้ฟังก์ชันเพื่อจัดรูปแบบวันที่
            row.appendChild(dateCell);
            
            // แสดง Status
            const statusCell = document.createElement('td');
            statusCell.textContent = record.status;
            row.appendChild(statusCell);
            
            tableBody.appendChild(row);  // เพิ่มแถวเข้าไปในตาราง
        });
    } catch (error) {
        console.error('Error loading check-in history:', error);
    }
}


// Function for refreshing the page
function refreshCheckinHistory() {
    location.reload();  // Refreshes the entire page
}







// ฟังก์ชันแปลงวันที่ให้อยู่ในรูปแบบ "YYYY-MM-DD HH:mm:ss"
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // เดือนเริ่มจาก 0 จึงบวก 1
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}


// checkin-history.js
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/checkin-history');
        const data = await response.json();

        // แสดงข้อมูลเช็คอินในตารางหรือวิธีอื่นๆ
    } catch (error) {
        console.error('Error fetching check-in data:', error);
    }
});


//Searching 
function filterHistoryByIdAndDate() {
    const searchInputId = document.getElementById('search-input').value.trim();  // รับค่า Student ID จากช่อง input
    const searchInputDate = document.getElementById('search-input-date').value;  // รับค่า Date จากช่อง input

    // ตรวจสอบว่าช่องไหนยังว่างอยู่ ถ้ายังว่างให้แสดงการแจ้งเตือน
    if (!searchInputId && !searchInputDate) {
        alert('Please enter at least one Student ID or Date field before searching.');
        return; // หยุดฟังก์ชันเพื่อให้ผู้ใช้กรอกข้อมูล
    }

    const table = document.getElementById('checkin-history-table').querySelector('tbody');
    const rows = table.querySelectorAll('tr');  // ดึงทุกแถวในตาราง
    let hasMatchingRows = false;  // ตัวแปรเพื่อตรวจสอบว่ามีข้อมูลตรงหรือไม่

    rows.forEach(row => {
        const studentIdCell = row.querySelector('td').textContent;     // อ่านค่า Student ID จากเซลล์แรกในแถว
        const dateCell = row.querySelectorAll('td')[1].textContent;    // อ่านค่า Date จากเซลล์ที่สองในแถว

        // ตรวจสอบว่า Student ID และ Date ตรงกับค่าที่กรอกหรือไม่
        const isIdMatch = searchInputId ? studentIdCell.includes(searchInputId) : true; // ตรวจสอบ Student ID
        const isDateMatch = searchInputDate ? dateCell.startsWith(searchInputDate) : true; // ตรวจสอบ Date

        if (isIdMatch && isDateMatch) {
            row.style.display = '';  // แสดงแถวที่ตรงกับการค้นหา
            hasMatchingRows = true;  // พบข้อมูลที่ตรง
        } else {
            row.style.display = 'none';  // ซ่อนแถวที่ไม่ตรง
        }
    });

    // ถ้าไม่มีแถวที่ตรงกับการค้นหา ให้แสดงป๊อปอัพว่า "ไม่มีข้อมูลที่หา"
    if (!hasMatchingRows) {
        alert('No information found matching your search.');  // แสดงป๊อปอัพเมื่อไม่มีข้อมูลที่ตรง
    }
}


    
  
// ฟังก์ชันสำหรับการดาวน์โหลดข้อมูลในรูปแบบ CSV
function downloadCSV() {
    const table = document.getElementById('checkin-history-table');
    let csvContent = "data:text/csv;charset=utf-8,";

    // ดึงหัวตาราง
    const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent);
    csvContent += headers.join(",") + "\r\n";

    // ดึงข้อมูลแต่ละแถวที่แสดงอยู่ (เฉพาะแถวที่ไม่ถูกซ่อน)
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        if (row.style.display !== 'none') {  // ตรวจสอบว่าแถวนี้ไม่ถูกซ่อน
            const rowData = Array.from(row.querySelectorAll('td')).map(td => td.textContent);
            csvContent += rowData.join(",") + "\r\n";
        }
    });

    // สร้างลิงก์เพื่อดาวน์โหลดไฟล์ CSV
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "checkin_history.csv");
    document.body.appendChild(link);

    link.click(); // เรียกการดาวน์โหลด
    document.body.removeChild(link);
}

