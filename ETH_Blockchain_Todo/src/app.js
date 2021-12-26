App = {
    loading: false,
    contracts: {},
    
    //  ===========================================================================================
    //  Load Blockchain Account & Smart Contract
    //  ===========================================================================================
    
    // Load the app...
    load2Blockchain: async () => {
        await App.loadWeb3()
        await App.loadAccount()
        await App.loadContract()
        await App.render()
    },

    loadWeb3: async () => {
        if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider
            web3 = new Web3(web3.currentProvider)
        } else window.alert("Please connect to Metamask.")

        // Modern dapp browsers...
        if (window.ethereum) {
            window.web3 = new Web3(ethereum)
            try {
                // Request account access if needed
                await ethereum.enable()
                // Acccounts now exposed
                web3.eth.sendTransaction({})
            } catch (error) { } // User denied account access...
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = web3.currentProvider
            window.web3 = new Web3(web3.currentProvider)
            // Acccounts always exposed
            web3.eth.sendTransaction({})
        }
        // Non-dapp browsers...
        else { console.log('Non-Ethereum browser detected. You should consider trying MetaMask!') }
    },

    loadAccount: async () => {
        web3.eth.defaultAccount = web3.eth.accounts[0]
        App.account             = web3.eth.accounts[0]
    },

    loadContract: async () => {
        const todoList = await $.getJSON('TodoList.json')
        App.contracts.TodoList = TruffleContract(todoList)
        App.contracts.TodoList.setProvider(App.web3Provider)

        // Hydrate the smart contract with values from the blockchain...
        App.todoList= await App.contracts.TodoList.deployed()
    },

    //  ===========================================================================================
    //  Render the application...
    //  ===========================================================================================

    render: async () => {
        // Prevent double render
        if (App.loading) return

        // Update app loading state
        App.setLoading(true)

        // Render Account
        $('#account').html(App.account)

        // Render Tasks
        await App.renderTasks()

        // Update loading state
        App.setLoading(false)
    },

    renderTasks: async () => {
        // Load the total task count from the blockchain
        const taskCount = await App.todoList.taskCount()
        const $tasksTable = $('#tasksTable')
    
        // Render out each task with a new task template
        for (var i = 1; i <= taskCount; i++) {
            // Fetch the task data from the blockchain
            const task = await App.todoList.tasks(i)  // task[0] = taskId, task[1] = taskDescription, task[2] = taskConclusionDate, task[3] = taskCompleted
            const taskId = task[0].toNumber()
            const taskDataConcluded = App.compareDates(task[2])
            const taskCompleted = task[3]
            
            // Create the html for the task
            $tasksTable.append(
                `<tr ${App.getAppropriatedStyleState(taskCompleted, taskDataConcluded, 'background-color')}>
                <td>${taskId}</td>
                <td id="taskContent${taskId}" ${App.getAppropriatedStyleState(taskCompleted, taskDataConcluded, 'line-through')}>${task[1]}</td>
                <td>
                    <input id="taskConclusionDate${taskId}" type="text" placeholder="${task[2]}" onfocus="(this.type='date')" onblur="(this.type='text')">
                </td>
                <td>${App.getAppropriatedStyleState(taskCompleted, taskDataConcluded, 'completed-emoji')}</td>
                <td id="actions">
                        <button class="btn btn-success" onclick="App.changeTaskState(${taskId}); return false;">Finished</button>
                        <button class="btn btn-warning" onclick="App.editTask(${taskId}); return false;">Edit</button>
                        <button class="btn btn-danger" onclick="App.deleteTask(${taskId}); return false;">Delete</button>
                    </td>
                </tr>`)
        }
    },

    //  ===========================================================================================
    //  Tasks Management
    //  ===========================================================================================

    // Add a new task
    createTask: async () => {
        App.setLoading(true)
        // Get the task contents from the form
        const taskContent = $('#newTaskName').val()
        const taskConclusionDate = $('#newTaskDate').val()
        await App.todoList.createTask(taskContent, taskConclusionDate).catch(console.log)
        window.location.reload()
    },

    deleteTask: async (taskId) => {
        App.setLoading(true)
        await App.todoList.deleteTask(taskId).catch(console.log)
        window.location.reload()
    },

    editTask: async (taskId) => {
        App.setLoading(true)
        await App.todoList.editTask(taskId, $(`#taskContent${taskId}`).text(), $(`#taskConclusionDate${taskId}`).val()).catch(console.log)
        window.location.reload()
    },

    changeTaskState: async (taskId) => {
        App.setLoading(true)
        await App.todoList.changeTaskState(taskId).catch(console.log)
        window.location.reload()
    },

    setLoading: (boolean) => {
        App.loading = boolean
        const loader  = $('#loader'), content = $('#content');
        if (boolean)    { loader.show(); content.hide() } 
        else            { loader.hide(); content.show() }
    },

    getAppropriatedStyleState: (taskCompleted=false, taskDataConcluded=false, wanted_style='') => {
        if (wanted_style=='background-color') 
            return !taskCompleted && taskDataConcluded ? 'style="background-color: #bf5d5d;"' : taskCompleted ? 'style="background-color: #7cba7e;"' : ""
        else if (wanted_style=='line-through') 
            return taskCompleted || taskDataConcluded ? 'style="text-decoration: line-through;"' : 'contenteditable="true"'
        else if (wanted_style=='completed-emoji') 
            return taskCompleted ? '✅' : '❌'
    },


    // Compare today's date with the task's conclusion date
    compareDates: (taskConclusionDate) => { return new Date(taskConclusionDate) < new Date() }
}

$(() => { $(window).load(() => App.load2Blockchain() ); })
