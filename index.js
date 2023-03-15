import express from "express";
import cors from "cors";
import {authMe, completeTodo, deleteTodo, getAllTodos, getUsers, logIn, setTodo, setUser} from './db.js'
import {checkAuth} from "./utils/checkAuth.js";
import handleErrors from "./utils/handleValidationErrors.js";
import {registerValidator, loginValidation} from "./validator.js";

const app = express()

app.use(express.json())
app.use(cors())

app.get('/auth/me', checkAuth, authMe)
app.get('/users', getUsers)
app.get('/todos', checkAuth, getAllTodos)
app.delete('/todos/:todo_id', checkAuth, deleteTodo)
app.put('/todos/:todo_id', checkAuth, completeTodo)
app.post('/login', loginValidation, handleErrors, logIn)
app.post('/users', registerValidator, handleErrors, setUser)
app.post('/todo', checkAuth, setTodo)

app.listen(process.env.PORT || 5000, (err) => {
    if (err) {
        console.log('something went wrong')
    }
})