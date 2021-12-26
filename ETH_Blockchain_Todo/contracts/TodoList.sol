pragma solidity ^0.5.0;

contract TodoList {
    uint public taskCount = 0;

    struct Task {
        uint id;
        string description;
        string conclusion_date;
        bool completed;
    }

    mapping (uint => Task) public tasks;

    //  Events
    event TaskCreated(uint id, string description, string conclusion_date, bool completed);
    event TaskDeleted();
    event TaskEdited(uint id, string description, string conclusion_date);
    event TaskStateChange(uint id, bool completed);

    constructor() public { createTask("This is a Default Task", "This is a Default Date"); }

    function createTask(string memory _description, string memory _conclusion_date) public returns (uint) {
        tasks[taskCount]= Task(++taskCount, _description, _conclusion_date, false);
        emit TaskCreated(taskCount, _description, _conclusion_date, false);
    }

    function deleteTask(uint _id) public {
        for (uint i = _id; i < taskCount; i++) {
            tasks[i]= tasks[i+1];
            tasks[i].id--;
        } taskCount--;
        emit TaskDeleted();
    }

    function editTask(uint _id, string memory _description, string memory _conclusion_date) public {
        tasks[_id].description = _description;
        tasks[_id].conclusion_date = _conclusion_date;
        emit TaskEdited(_id, _description, _conclusion_date);
    }

    function changeTaskState(uint _id) public returns (bool) {
        tasks[_id].completed = !tasks[_id].completed;
        emit TaskStateChange(_id, tasks[_id].completed);
    }
}