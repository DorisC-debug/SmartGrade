import express from 'express'
import cors from 'cors'
import { PORT } from './config.js'
import { UserRepository } from './UserRepository.js'

const app = express()
app.use(cors())  // Permite peticiones desde frontend (puertos diferentes)
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Servidor backend funcionando')
})

app.post('/login', async (req, res) => {
  const { correo, contraseña } = req.body

  try {
    const user = await UserRepository.login({ correo, contraseña })
    res.send(user)
  } catch (error) {
    res.status(401).send(error.message)
  }
})

app.post('/register', async (req, res) => {
  const { correo, contraseña } = req.body
  console.log({ correo, contraseña })

  try {
    const id = await UserRepository.create({ correo, contraseña })
    res.send({ id })
  } catch (error) {
    res.status(400).send(error.message)
  }
})

app.post('/logout', (req, res) => {
  // Aquí podrías invalidar sesión o token, dependiendo del método de auth que uses
  res.send({ message: 'Logout exitoso' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})


