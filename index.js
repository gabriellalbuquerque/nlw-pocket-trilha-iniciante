const { select, input, checkbox } = require('@inquirer/prompts')
const fs = require("fs").promises

let message = ""
let goals

async function loadGoals() {
    try{
        const data = await fs.readFile("goals.json", "utf-8")
        goals = JSON.parse(data)
    } catch (error){
        goals = []
    }
}

async function saveGoals() {
    await fs.writeFile("metas.json", JSON.stringify(goals, null, 2))
}

async function registerGoal() {
    const goal = await input({message: "Digite a meta:"})
    
    if(goal.length == 0){
        message = 'Por favor, digite a meta a ser registrada!'
        return registerGoal()
    }

    goals.push( { value: goal, checked: false} )

    message = "Meta cadastrada com sucesso!"
}

async function listGoals() {

    if(goals.length == 0) {
        message = 'Não existem metas!'
        return
    }

    const answers = await checkbox({
        message:"Use as setas para mudar de meta, o espaço para marcar ou desmarcar e o Enter para finalizar essa etapa.",
        choices:[...goals],
        instructions: false
    })

    goals.forEach((g) => {
        g.checked = false
    })
    
    if(answers.length === 0){
        message = 'Nenhuma meta selecionada!'
        return
    }

    answers.forEach((answer) => {
        const goal = goals.find((g) => {
            return g.value == answer
        })

        goal.checked = true
    })

    message = "Meta(s) marcada(s) como concluídas concluídas."
}

async function doneGoals() {
    if(goals.length == 0) {
        message = 'Não existem metas!'
        return
    }

    const done = goals.filter((goal) => {
        return goal.checked
    })
    
    if(done.length === 0) {
        message = "Não existem metas realizadas!"
        return
    }

    await select({
        message:"Metas realizadas: " + done.length,
        choices: [...done]
    })
}

async function openGoals() {
    if(goals.length == 0) {
        message = 'Não existem metas!'
        return
    }

    const open = goals.filter((goal) => {
        return !goal.checked
    })

    if(open.length == 0){
        message = 'Não existem metas!'
        return
    }

    await select({
        message: "Metas Abertas: " + open.length,
        choices: [...open]
    })
}

async function deleteGoal() {

    if(goals.length == 0) {
        message = 'Não existem metas!'
        return
    }

    const uncheckedGoals = goals.map((goal) => {
        return { value: goal.value, checked: false }
    })

    const toDelete = await checkbox({
        message:"Selecione item para deletar:",
        choices:[...uncheckedGoals],
        instructions: false
    })

    if(toDelete.length == 0) {
        message = "Nenhum item para deletar!"
        return
    }

    toDelete.forEach((item) => {
        goals = goals.filter((goal) => {
            return goal.value != item
        })
    })

    message = "Meta(s) deletada(s) com sucesso!"
    
}

function showMessage() {
    console.clear()

    if(message != "") {
        console.log(message)
        console.log("")
        message = ""
    }

}

async function start () {

    await loadGoals()
    
    while(true) {   
        
        showMessage()
        await saveGoals()

        const option = await select({
            message: "Menu: >",
            choices: [
                {
                    name: "Cadastrar Meta",
                    value: "cadastrar"
                },
                {
                    name: "Listar Metas",
                    value: "listar"  
                },
                {
                    name: "Metas Realizadas",
                    value: "realizadas"  
                },
                {
                    name: "Metas Abertas",
                    value: "abertas"  
                },
                {
                    name: "Deletar Metas",
                    value: "deletar"  
                },
                {
                    name: "Sair",
                    value: "sair"
                }
            ]
        })

        switch(option){
            case "cadastrar":
                await registerGoal()
                break
            case "listar":
                await listGoals()
                break
            case "realizadas": 
                await doneGoals()
                break
            case "abertas":
                await openGoals()
                break
            case "deletar":
                await deleteGoal()
                break
            case "sair":
                return
        }
        
    }
}

start()