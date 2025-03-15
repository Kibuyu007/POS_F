import { useEffect, useState } from 'react'
import axios from 'axios'

const Signup = () => {

    const [count, setCount] = useState(0)
  const [file, setFile] = useState()
  const [regi, setRegi] = useState({

    name: '',
    email: '',
    password: '',
  })

  const handleChange = (e) => {
    const {name,value} = e.target;
    setRegi({...regi,[name]:value})
  }

  const uploadImg = async (e) => {

    e.preventDefault()

    try {

      const formData = new FormData()
      formData.append('file', file)
      formData.append('name', regi.name)
      formData.append('email', regi.email)
      formData.append('password', regi.password)
      await axios.post("http://localhost:3010/api/auth/register", formData)
      console.log(formData)

    } catch (error) {
      console.log(error)
    }
    
  }

  const getPicture = async () => {

    try {
      const response = await axios.get()
      setFile()
    } catch (error) {
      
    }
  }


  useEffect(()=>{
    getPicture()
  })



  return (
    <>

    <form onSubmit={uploadImg}>

    <h1>Upload Picture</h1>
      <div className="card">

      <input
        type='text'
        placeholder='username'
        name='name'
        value={regi.username}
        onChange={handleChange}
      />

      <input
        type='email'
        placeholder='email'
        name='email'
        value={regi.email}
        onChange={handleChange}
      />

      <input
        type='password'
        placeholder='password'
        name='password'
        value={regi.password}
        onChange={handleChange}
      />

      <input 
        type='file'
        filename='file' 
        onChange={(e) => setFile(e.target.files[0])}
      />
        <button>
          Upload
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>


    </form>
    
    </>
  )
}

export default Signup