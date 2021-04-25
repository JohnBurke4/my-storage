import React from 'react'
import FileCard from './FileCard'
import {uploadFilesToDatabase, getUserFileTypesAndIds} from '../api/Calls'

class FilesPage extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            fileList: null,
            files: [],
            reload: false
        }
        this.uploadFiles = this.uploadFiles.bind(this);
        this.setFiles = this.setFiles.bind(this);
    }

    render() {
        return (
            <div className='container-fluid'>
                <div className='m-5 '>
                    <h1 className='text-center display-1'>My Files</h1>
                </div>
                <div className='d-flex m-5 justify-content-center'>
                    <div className='row align-items-center'>
                        {this.state.files.map((file) => {
                            return <div className='col m-3'>
                                <FileCard mimeType={file.fileType} fileName={file.fileName} fileId={file.fileLocation} decryptionKey={file.decryptionKey} key={file.fileLocation}></FileCard>
                                </div>
                        })}
                    </div>
                </div>
                <div className='container'>
                <div className="custom-file mb-4">
                    <label className="form-label" for="customFile">Upload a file</label>
                    <input type="file" className="form-control" id="customFile" multiple onChange={this.setFiles}></input>
                </div>
                
                <button type='button' className='btn btn-primary' onClick={this.uploadFiles}>Upload</button>
                </div>
            </div>
        );
    }

    async componentDidMount(){
        let files = await getUserFileTypesAndIds();
        console.log(files);
        this.setState({
            files: files,
        });
    }

    setFiles(event) {
        this.setState({
            fileList: event.target.files,
        });
    }

    async uploadFiles(event) {
        await uploadFilesToDatabase(this.state.fileList);
        this.componentDidMount();
        
    }
}

export default FilesPage;