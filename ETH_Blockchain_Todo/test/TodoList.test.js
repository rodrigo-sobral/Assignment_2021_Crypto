const TodoList= artifacts.require("./TodoList.sol");

contract('TodoList', (accounts) => {
    before(async () => this.todoList= await TodoList.deployed())

    it('deploys successfully', async () => {
        const address= await this.todoList.address;
        //  Make sure the contract is deployed on the blockchain
        assert.notEqual(address, 0x0);
        assert.notEqual(address, '');
        assert.notEqual(address, null);
        assert.notEqual(address, undefined);
    })

    it('lists tasks', async () => {
        const taskCount= await this.todoList.taskCount();
        const task= await this.todoList.tasks(taskCount);
        //  Make sure the count is correct and we can fetch the count out of the mapping

        assert.equal(task.id.toNumber(), taskCount.toNumber());
    })

    it('creates tasks', async () => {
        const result= await this.todoList.createTask('A new task');
        const taskCount= await this.todoList.taskCount();
        //  Make sure the count is correct and we can fetch the count out of the mapping

        assert.equal(taskCount, 2);
        const event= result.logs[0].args;
        assert.equal(event.id.toNumber(), taskCount.toNumber());
        assert.equal(event.description, 'A new task');
        assert.equal(event.completed, false);
    })

    it('toggles task completion', async () => {
        const result= await this.todoList.changeTaskState(1);
        const task= await this.todoList.tasks(1);
        
        assert.equal(task.completed, true);
        const event= result.logs[0].args;
        assert.equal(event.id.toNumber(), 1);
        assert.equal(event.completed, true);
    })
});