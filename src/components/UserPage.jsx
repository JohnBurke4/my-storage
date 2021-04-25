import React, {Suspense} from 'react'
import {createGroup, getMyGroups} from '../api/Calls'
import GroupCard from './GroupCard'
import Spinner from './Spinner'

class UserPage extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            groups: [],
            groupName: ''
        }
        this.getGroups = this.getGroups.bind(this);
        this.updateGroupName = this.updateGroupName.bind(this);
        this.submitGroup = this.submitGroup.bind(this);
    }
    render() {
        const groups = this.state.groups?.map((group, i) => {
                return <div className='m-3' key={i}>
                <GroupCard groupName={group.groupName} groupId={group.groupId} groupCollapseId={"collapse" + i} ></GroupCard>
                </div>
        });
        return (
            <div className='container'>
                <div className='m-5 '>
                    <h1 className='text-center display-1'>Groups</h1>
                </div>
                        {groups}
                        <div className='container mb-3'>
                        <div className="custom-file mb-4">
                            <label className="form-label" for="groupName" >Choose a Group Name:</label>
                            <input type="text" className="form-control" id="groupName" value={this.state.groupName} onChange={this.updateGroupName}></input>
                        </div>
                
                        <button type='button' className='btn btn-primary' onClick={this.submitGroup}>Create Group</button>
                    </div>
            </div>
        );
    }

    componentDidMount(){
        this.getGroups();
    }

    componentDidUpdate(){
        this.getGroups();
    }

    async getGroups() {
        let groups = await getMyGroups();
        this.setState({
            groups: groups
        })
        
    }

    updateGroupName(event){
        this.setState({groupName: event.target.value});
    }

    async submitGroup(event) {
        event.preventDefault();
        try{
            console.log(this.state.groupName);
            await createGroup(this.state.groupName);
        }
        catch(error){
            console.error(error);
        }
        this.setState({
            groupName: ''
        })
        
        
    }
}

export default UserPage;