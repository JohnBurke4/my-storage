import React from 'react'

class FileCard extends React.Component {
    constructor(props) {
        super(props);
        
        this.downloadFile = this.downloadFile.bind(this);
        this.deleteFile = this.deleteFile.bind(this);
    }

    render() {
        let icon = <i></i>
        if (this.props.mimeType.includes('image')){
            icon = <i className='card-img-top bi bi-card-image text-center display-1 bg-dark p-5' style={{color: 'white'}}></i>
        }
        else if (this.props.mimeType.includes('video')){
            icon = <i className='card-img-top bi bi-camera-video text-center display-1 bg-dark p-5' style={{color: 'white'}}></i>
        }
        else {
            icon = <i className='card-img-top bi bi-file-earmark text-center display-1 bg-dark p-5' style={{color: 'white'}}></i>
        }
        return (
            <div className='card' style={{width: 18 + 'rem'}}>
                    {icon}
                <div className='card-body'>
                    <h5 className='card-title'>{this.props.fileName}</h5>
                    <p className='card-text'>Unencrypted!</p>
                    <div className='align-items-center row'>

                    <button type='button' className='btn btn-primary col ms-3 me-2' onClick={this.downloadFile}>View File</button>
                    <button type='button' className='btn btn-danger col me-3 ms-2' onClick={this.deleteFile}>Delete File</button>
                    </div>
                </div>
            </div>
        );
    }

    async downloadFile() {
        await this.props.downl(this.props.fileId, this.props.decryptionKey, this.props.mimeType, this.props.fileName);
    }

    async deleteFile() {
        await this.props.delete(this.props.fileId);
    }
}

FileCard.defaultProps = {
    mimeType: 'file',
    fileName: 'Unknown File'
}



export default FileCard;