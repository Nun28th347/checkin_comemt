import pkg from 'pg'; 

// สร้างแอปพลิเคชันเว็บเซิร์ฟเวอร์
import express from 'express'; 

// แปลงข้อมูลใน request body ให้อยู่ในรูปแบบ JSON
import bodyParser from 'body-parser'; 

// ทำงานกับเส้นทางของไฟล์ในระบบไฟล์
import path from 'path'; 

// นำเข้า `fileURLToPath` จากโมดูล `url` เพื่อแปลง URL เป็นเส้นทางไฟล์ [Excel]
import { fileURLToPath } from 'url'; 

// ดึง`Pool` จากโมดูล `pg` เพื่อconnection pool สำหรับ PostgreSQL
const { Pool } = pkg;

const app = express();
app.use(bodyParser.json()); //JSON ที่ได้รับจาก client



// PostgreSQL connection configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'check_in_four',
  password: 'n',
  port: 5432,
});


// test Start server on port 3000
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});



/* LOGIN SYSTEM */

// Middleware
app.use(bodyParser.json());  // เปิดใช้งาน body-parser เพื่อแปลง request body เป็น JSON

// เสิร์ฟไฟล์ static จากโฟลเดอร์ 'public' HTML, CSS หรือ JavaScript เข้าถึงได้
app.use(express.static('public'));  

// Endpoint สำหรับล็อคอิน 
app.post('/login', async (req, res) => { //go to login page
  const { username, password } = req.body; // ใช้ req.body เพื่อเข้าถึงข้อมูล username และ password ที่ถูกส่งมาจาก client
  try 
  {
    // ดึงข้อมูล user จากฐานข้อมูล , 1 = user... ==> result
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0]; //[0] ==> user

    // ตรวจสอบว่า username และ password ถูกต้อง
    if (user && password === user.password) 
    {
      // ถ้าล็อคอินสำเร็จ, ส่งข้อมูล role กลับไปด้วย
      res.json({ success: true, role: user.role });
    } 
    else 
    {
      // ส่ง error ถ้าข้อมูลล็อคอินไม่ถูกต้อง
      res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
  } 
  catch (error) 
  {
    console.error('Error during login:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});




// Serve index page after login (เสิร์ฟหน้า index เมื่อมีการร้องขอ)
//__dirname = dirปัจจุบันของไฟล์สคริปต์
app.get('/html/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));  // ส่งไฟล์ index.html ให้ client
}); 




/* GET ที่ URL /checkin-history */
app.get('/checkin-history', async (req, res) => {
  const { user_id, role } = req.body;  // รับ user_id และ role จาก request body (คุณอาจต้องปรับให้รับจาก session หรือ token ถ้าใช้)

  try {

    let result;
    if (role === 'teacher') 
    {
      // teacher เห็นข้อมูลทั้งหมด
      result = await pool.query('SELECT * FROM checkin_history');
    } 
    else if (role === 'student') 
    {
      // student เห็นเฉพาะข้อมูลของตัวเอง
      result = await pool.query('SELECT * FROM checkin_history WHERE student_id = $1', [user_id]);
    }

    res.json({
      success: true, //ดึงข้อมูลสำเร็จ
      role: role, //แสดงบทบาท
      history: result.rows,  // ส่งข้อมูล check-in history กลับไป
    });
  } 

  catch (error) 
  {
    console.error('Error fetching checkin history:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }

});



/* **************************** */



/* Express สามารถส่งไฟล์ from public */
// Path management for ES Module
const __filename = fileURLToPath(import.meta.url);  // แปลง URL ของโมดูลปัจจุบันเป็น path ของไฟล์
const __dirname = path.dirname(__filename); // หาที่อยู่dirที่ไฟล์ปัจจุบันอยู่

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public'))); // เสิร์ฟไฟล์สแตติกจากโฟลเดอร์ 'public'

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'index.html')); // ส่งไฟล์ index.html ให้ client เมื่อมีการร้องขอที่ root URL
});




/* ADD STUDENT */
// Serve add-student.html for '/add-student' route
// Endpoint to add a new student (POST /add-student)
app.post('/add-student', async (req, res) => {
  const { id, prefix_name, first_name, last_name, date_of_birth, sex, curriculum_id, previous_school, address, telephone, email, line_id, status, section_id } = req.body;


  //SUC
  try {
    
    await pool.query(

      //INSERT INTO
      `INSERT INTO student (id, prefix_name, first_name, last_name, date_of_birth, sex, curriculum_id, previous_school, address, telephone, email, line_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`, // id=1,perfix=2,.....
      [id, prefix_name, first_name, last_name, date_of_birth, sex, curriculum_id, previous_school, address, telephone, email, line_id, status]
    );

    res.status(200).send('Student added successfully');
  } 

  //FAIL
  catch (error) 
  {
    console.error('Error adding student:', error);
    res.status(500).send('Failed to add student');
  }
});



/* SHOW ALL  */
// Endpoint to get all sections
app.get('/api/sections', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, section FROM section'); // ดึงid, section จากsectionมา
    res.json(result.rows); //send json back
  } 
  
  catch (error) 
  {
    console.error('Error fetching sections:', error);
    res.status(500).send('Internal Server Error');
  }
});


/* CHECK-IN => student_id & section_id , POST*/
// Endpoint to handle check-in
app.post('/api/checkin', async (req, res) => 
  {
  console.log('Received check-in data:', req.body); // แสดงข้อมูลการเช็คอินที่ได้รับ
  const { student_id, section_id } = req.body; // ดึง student_id และ section_id จาก request body

  // Convert student_id and section_id to INTEGER
  const parsedStudentId = parseInt(student_id);
  const parsedSectionId = parseInt(section_id);

  // Validate that both IDs are numbers
  if (isNaN(parsedStudentId) || isNaN(parsedSectionId)) {
    return res.status(400).send('Invalid student ID or section ID.');
  }


  //chack 
  try {
    // student_id มีอยู่ในฐานข้อมูลหรือไม่
    const studentCheckQuery = `SELECT * FROM student WHERE id = $1;`;
    const studentCheckResult = await pool.query(studentCheckQuery, [parsedStudentId]);

    if (studentCheckResult.rows.length === 0) {
      console.error('Student ID does not exist:', parsedStudentId);
      return res.status(400).send('Student ID does not exist.');
    }

    const sectionCheckQuery = `SELECT * FROM section WHERE id = $1;`;
    const sectionCheckResult = await pool.query(sectionCheckQuery, [parsedSectionId]);

    // section_id มีอยู่ในฐานข้อมูลหรือไม่
    if (sectionCheckResult.rows.length === 0) 
    {
      console.error('Section ID does not exist:', parsedSectionId);
      return res.status(400).send('Section ID does not exist.');
    }

    // สร้าง id ใหม่จาก student_id และ section_id
    const generatedId = parsedStudentId * 100 + parsedSectionId;

    // เช็คอินอยู่ใน student_list ?
    const existingCheckIn = await pool.query(
      `SELECT * FROM student_list WHERE id = $1;`, 
      [generatedId]
    );


    // => have update
    //ทำการอัปเดตบันทึกการเช็คอินที่มีอยู่แล้วในระบบ
    if (existingCheckIn.rows.length > 0) 
    {
      // Update existing check-in record
      await pool.query(
        `UPDATE student_list 
         SET active_date = NOW(), status = 'Checked In' 
         WHERE id = $1;`, 
        [generatedId]
      );
      return res.status(200).send('Check-in updated successfully');
    } 

    //สร้างบันทึกการเช็คอินใหม่ในระบบ
    else 
    {
      // Insert new check-in record
      await pool.query(
        `INSERT INTO student_list (id, section_id, student_id, active_date, status) 
         VALUES ($1, $2, $3, NOW(), $4);`,
        [generatedId, parsedSectionId, parsedStudentId, 'Checked In']
      );

      res.status(200).send('Check-in successful');
    }
  } 
  catch (error) 
  {
    console.error('Failed to check in student:', error);
    res.status(500).send('Failed to check in student');
  }
});




/* SHOW ALL */
// Endpoint to get all check-in history
app.get('/api/checkin-history', async (req, res) => {
  try {
    // ดึงข้อมูลทั้งหมดจากตาราง student_list
    const result = await pool.query(`
      SELECT sl.student_id, s.first_name, s.last_name, sl.active_date, sl.status
      FROM student_list sl
      JOIN student s ON sl.student_id = s.id
      ORDER BY sl.active_date DESC
    `);
    res.json(result.rows);  // ส่งข้อมูลที่ดึงมาในรูปแบบ JSON
  } catch (error) {
    console.error('Error fetching check-in history:', error);
    res.status(500).send('Internal Server Error');
  }
});





/* SHOW ALL */
app.get('/api/students', async (req, res) => {
  try {
      const result = await pool.query('SELECT id, first_name, last_name FROM student');
      res.json(result.rows);  // ส่งข้อมูลนักเรียนในรูปแบบ JSON
  } catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).send('Internal Server Error');  // ส่งข้อความหากเกิดข้อผิดพลาด
  }
});



// Check student BY id
app.post('/check-in/:studentId', async (req, res) => {
  const { studentId } = req.params;

  // Convert studentId to integer
  const parsedStudentId = parseInt(studentId);
  if (isNaN(parsedStudentId)) {
    return res.status(400).send('Invalid student ID.');
  }

  // สร้างคำสั่ง SQL สำหรับอัปเดตวันที่เช็คอินของนักเรียน
  try {
    const updateCheckInQuery = 
    `
        UPDATE student_list
        SET active_date = NOW()
        WHERE student_id = $1
    `;
    await pool.query(updateCheckInQuery, [parsedStudentId]); // รออัปเดตข้อมูล Use parsedStudentId
    
    res.status(200).send('Student checked in successfully');
  } 

  catch (error) 
  {
    console.error('Failed to check in student', error);
    res.status(500).send('Failed to check in student');
  }
});


// Endpoint สำหรับดึงประวัติการเช็คอิน
app.get('/api/checkin-history', async (req, res) => {
  const userId = req.session.user.id; // ดึง user ID จาก session ที่ล็อกอินอยู่

  try {
      const result = await pool.query('SELECT * FROM checkin WHERE student_id = $1', [userId]);// ดึงข้อมูลประวัติการเช็คอินที่เกี่ยวข้องกับ student_id
      res.status(200).json(result.rows);
  } 
  catch (error) 
  {
      console.error('Error fetching check-in history:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});
