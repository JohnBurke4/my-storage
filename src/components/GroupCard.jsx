import React, { Suspense } from 'react'
import {getGroupFiles, uploadFilesToGroup, getFile, addToGroupEmail, removeFromGroupEmail} from '../api/Calls'
import Spinner from './Spinner'
import FileCard from './FileCard'


class GroupCard extends React.Component {
    constructor(props) {
        super(props);
        this.getFiles = this.getFiles.bind(this);
        
        this.uploadFiles = this.uploadFiles.bind(this);
        this.setFiles = this.setFiles.bind(this);
        this.downloadFile = this.downloadFile.bind(this);
        this.updateAddEmail = this.updateAddEmail.bind(this);
        this.updateRemoveEmail = this.updateRemoveEmail.bind(this);
        this.removeUser = this.removeUser.bind(this);
        this.addUser = this.addUser.bind(this);
        this.state = {
            files: [],
            fileList: [],
            addEmail: '',
            removeEmail:'',
        }
    }

    render() {
        const files = this.state.files.length === 0 ? 
        <div>
            <h3>No files have been shared</h3>
        </div>
        :
         (
            <div className='d-flex m-5 justify-content-center'>
                <div className='row align-items-center'>
                        {this.state.files?.map((file, i) => {
                            return <div className='col m-3'>
                                <FileCard key={i} mimeType={file.fileType} fileName={file.fileName} fileId={file.fileLocation} decryptionKey={file.decryptionKey} key={file.fileLocation} delete={this.deleteFile} downl={this.downloadFile}></FileCard>
                                </div>
                                
                        })}
                    </div>
            </div>
        );
        return (
            <div className='card' >
    	        <h3 className='text-center m-3' data-bs-toggle='collapse' data-bs-target={'#' + this.props.groupCollapseId} type='button' >{this.props.groupName}</h3>
                <div className='collapse' id={this.props.groupCollapseId}>
                    {files}
                    <div className='container mb-3'>
                        <div className="custom-file mb-4">
                            <label className="form-label" for="customFile">Upload a file</label>
                            <input type="file" className="form-control" id="customFile" multiple onChange={this.setFiles}></input>
                        </div>
                
                        <button type='button' className='btn btn-primary' onClick={this.uploadFiles}>Upload</button>
                    </div>
                    <div className='container mb-3'>
                        <div className="custom-file mb-4">
                            <label className="form-label" for="addEmail" >Choose an email to add:</label>
                            <input type="text" className="form-control" id="addEmail" value={this.state.addEmail} onChange={this.updateAddEmail}></input>
                        </div>
                
                        <button type='button' className='btn btn-primary' onClick={this.addUser}>Add to group</button>
                    </div>
                    <div className='container mb-3'>
                        <div className="custom-file mb-4">
                            <label className="form-label" for="removeEmao;" >Choose an email to remove:</label>
                            <input type="text" className="form-control" id="removeEmail" value={this.state.removeEmail} onChange={this.updateRemoveEmail}></input>
                        </div>
                
                        <button type='button' className='btn btn-primary' onClick={this.removeUser}>Remove from group</button>
                    </div>
                </div>
            </div>
        );
    }

    componentDidMount(){
        this.getFiles();
    }

    async getFiles() {
        const data = await getGroupFiles(this.props.groupId);
        this.setState({
            files: data
        });
    }

    setFiles(event) {
        this.setState({
            fileList: event.target.files,
        });
    }

    async uploadFiles(event) {
        await uploadFilesToGroup(this.props.groupId, this.state.fileList);
        await this.getFiles();
    }

    

    async downloadFile(fileId, decryptionKey, mimeType, fileName) {
        let file = await getFile(fileId, decryptionKey, mimeType);
        let a = document.createElement('a');
        let fileUrl = URL.createObjectURL(file);
        a.href = fileUrl;
        a.download = fileName;
        a.click();
    }

    updateAddEmail(event){
        this.setState({addEmail: event.target.value});
    }

    updateRemoveEmail(event){
        this.setState({removeEmail: event.target.value});
    }

    async addUser(event){
        event.preventDefault();
        try{
            console.log(this.state.addEmail);
            await addToGroupEmail(this.state.addEmail, this.props.groupId);
        }
        catch(error){
            console.error(error);
        }
        this.setState({
            addEmail: ''
        })
        
    }

    async removeUser(event){
        event.preventDefault();
        try{
            console.log(this.state.removeEmail);
            await removeFromGroupEmail(this.state.removeEmail, this.props.groupId);
        }
        catch(error){
            console.error(error);
        }
        this.setState({
            removeEmail: ''
        })
        
    }
}



export default GroupCard;