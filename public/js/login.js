// login.js
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    try 
    {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
  
      const result = await response.json();
      if (result.success) 
        {

        // ถ้าเป็น teacher ให้ redirect ไปที่หน้า histrory
        if (result.role === 'teacher') 
        {
          window.location.href = '/html/html-tea/checkin-history.html';
        } 

        // ถ้าเป็น student ให้ redirect ไปที่หน้า index
        else if (result.role === 'student') 
          {
          window.location.href = '/html/html-std/index.html';
        }

        else if (result.role === 'admin') 
        {
          window.location.href = '/html/html-admin/index.html';
        }
      } 
      else 
      {
        alert(result.message);  // แสดงข้อความ error ถ้าล็อคอินผิดพลาด
      }

    } 

    catch (error) 
    {
      console.error('Login error:', error);
      alert('Error during login.');
    }
  });
  