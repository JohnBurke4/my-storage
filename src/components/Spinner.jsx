import React from 'react'

class Spinner extends React.Component {
    render() {
        return (
            <div className='spinner-border text primary' role='status'>
                <span class='visually-hidden'>Loading...</span>
            </div>
        );
    }
}

export default Spinner;