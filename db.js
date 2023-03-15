import mysql from "mysql2"
import dotenv from 'dotenv'
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
dotenv.config()

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_NAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
    port: process.env.MYSQL_PORT || 3306
}).promise();

export const authMe = async (req, res) => {
    try {
        const [user] = await pool.query(`SELECT * FROM users WHERE id = '${req.userId}'`)
        res.status(200).send(user)
    } catch (err) {
        res.status(500).send({message: err.message})
    }
}

export const getUsers = async (req, res) => {
    try {
        const [users] = await pool.query(`SELECT * FROM users`)
        res.status(200).send(users)
    } catch (err) {
        res.status(500).send({message: err.message})
    }
}

export const setUser = async (req, res) => {
    const {nickname, email, password} = req.body

    try {
        const [user] = await pool.query(`SELECT * FROM users WHERE email = '${email}'`)
        if (user.length > 0) {
            return res.status(409).send({
                msg: "This user is already in use!",
            });
        }

        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)
        await pool.query(`INSERT INTO users (nickname, pass, email) VALUES ('${nickname}', '${hash}', '${email}');`)

        const [data] = await pool.query(`SELECT * FROM users WHERE email = '${email}'`)

        const token = jwt.sign({
            id: data[0].id
        }, 'key', {
            expiresIn: '60m'
        })
        return res.status(201).send({...data[0], token})
    } catch (err) {
        res.status(500).send({message: err.message})
    }
}

export const logIn = async (req, res) => {
    const {email, password} = req.body

    try {
        const [user] = await pool.query(`SELECT * FROM users WHERE email = '${email}'`)
        if (user.length === 0) {
            return res.status(401).send({
                message: "Incorrect email or password",
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user[0].pass)

        if (!isPasswordValid) {
            return res.status(401).json({error: 'Incorrect email or password'})
        }

        const token = jwt.sign({
            id: user[0].id
        }, 'key', {
            expiresIn: '60m'
        })

        return res.status(200).json({...user[0], token})
    } catch (err) {
        res.status(500).send({message: err.message})
    }
}

export const setTodo = async (req, res) => {
    try {
        const {text} = req.body
        await pool.query(`INSERT INTO todos VALUES (0, '${text}', ${false}, '${req.userId}');`)
        res.status(200).send({message: 'done'})
    } catch (err) {
        res.status(500).send({message: err.message})
    }
}

export const getAllTodos = async (req, res) => {
    try {
        const [todos] = await pool.query(`SELECT * FROM todos WHERE user_id = ${req.userId}`)
        res.status(200).send(todos)
    } catch (err) {
        res.status(500).send({message: err.message})
    }
}

export const deleteTodo = async (req, res) => {
    try {
        await pool.query(`DELETE FROM todos WHERE user_id = ${req.userId} AND todo_id = ${req.params.todo_id}`)
        res.status(200).send({message: 'todo deleted successfully'})
    } catch (err) {
        res.status(500).send({message: err.message})
    }
}

export const completeTodo = async (req, res) => {
    try {
        await pool.query(`UPDATE todos SET completed = ${req.body.completed} WHERE user_id = ${req.userId} AND todo_id = ${req.params.todo_id}`)
        res.status(200).send({message: 'todo updated successfully'})
    } catch (err) {
        res.status(500).send({message: err.message})
    }
}
