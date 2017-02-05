import React from 'react'
import _ from 'lodash'
import namor from 'namor'

import CodeHighlight from './components/codeHighlight'
import ReactTable from '../src/index'


export default () => (
  <SubComponents />
)

export class SubComponents extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      sortingArray: [],
    }

    this.state.data = _.map(_.range(10), d => {
      return {
        firstName: namor.generate({ words: 1, numLen: 0 }),
        lastName: namor.generate({ words: 1, numLen: 0 }),
        age: Math.floor(Math.random() * 30)
      }
    })

  }

  addData() {
    let data = this.state.data;
    data.push({
        firstName: namor.generate({ words: 1, numLen: 0 }),
        lastName: namor.generate({ words: 1, numLen: 0 }),
        age: Math.floor(Math.random() * 30)
      })
    this.setState({data: data});
  }

  sortByFirstName() {
    let sortingArray = [{id: 'firstName', asc: true}];
    this.setState({sortingArray: sortingArray});
  }

  render() {

    const columns = [{
      header: 'Name',
      columns: [{
        header: 'First Name',
        accessor: 'firstName'
      }, {
        header: 'Last Name',
        id: 'lastName',
        accessor: d => d.lastName
      }]
    }, {
      header: 'Info',
      columns: [{
        header: 'Age',
        accessor: 'age'
      }]
    }]

    return (
      <div>
        <a href="#" onClick={this.addData.bind(this)}>Add more data!</a> &nbsp;
        <a href="#" onClick={this.sortByFirstName.bind(this)}>Programmatically sort by first name!</a>
        <br />
        <br />
        <div className='table-wrap'>
          <ReactTable
            className='-striped -highlight'
            data={this.state.data}
            columns={columns}
            defaultPageSize={10}
            closeSubComponentOnDataChange={false}
            preventAutoSortWhenSubComponentIsOpen={true}
            sorting={this.state.sortingArray}
            SubComponent={(row) => {
              return (
                <div style={{padding: '20px'}}>
                  <em>You can put any component you want here, even another React Table!</em>
                  <br />
                  <br />
                  {/*<ReactTable
                                      data={this.state.data}
                                      columns={columns}
                                      defaultPageSize={3}
                                      showPagination={false}
                                      SubComponent={(row) => {
                                        return (
                                          <div style={{padding: '20px'}}>
                                            <em>It even has access to the row data: </em>
                                            <CodeHighlight>{() => JSON.stringify(row, null, 2)}</CodeHighlight>
                                          </div>
                                        )
                                      }}
                                    />*/}
                </div>
              )
            }}
          />
        </div>
        <div style={{textAlign: 'center'}}>
          <br />
          <em>Tip: Hold shift when sorting to multi-sort!</em>
        </div>
        <CodeHighlight>{() => getCode()}</CodeHighlight>
      </div>
    )
  }
}

function getCode () {
  return `
export default () => (
  <SubComponents />
)

export class SubComponents extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: []
    }

    this.state.data = _.map(_.range(10), d => {
      return {
        firstName: namor.generate({ words: 1, numLen: 0 }),
        lastName: namor.generate({ words: 1, numLen: 0 }),
        age: Math.floor(Math.random() * 30)
      }
    })

  }

  addData() {
    let data = this.state.data;
    data.push({
        firstName: namor.generate({ words: 1, numLen: 0 }),
        lastName: namor.generate({ words: 1, numLen: 0 }),
        age: Math.floor(Math.random() * 30)
      })
    this.setState({data: data});
  }

  render() {

    const columns = [{
      header: 'Name',
      columns: [{
        header: 'First Name',
        accessor: 'firstName'
      }, {
        header: 'Last Name',
        id: 'lastName',
        accessor: d => d.lastName
      }]
    }, {
      header: 'Info',
      columns: [{
        header: 'Age',
        accessor: 'age'
      }]
    }]

    return (
      <div>
        <div onClick={this.addData.bind(this)}>Add more data!</div>
        <br />
        <div className='table-wrap'>
          <ReactTable
            className='-striped -highlight'
            data={this.state.data}
            columns={columns}
            defaultPageSize={10}
            closeSubComponentOnDataChange={false}
            preventAutoSortWhenComponentIsOpen={true}
            SubComponent={(row) => {
              return (
                <div style={{padding: '20px'}}>
                  <em>You can put any component you want here, even another React Table!</em>
                  <br />
                  <br />
                  {/*<ReactTable
                                      data={this.state.data}
                                      columns={columns}
                                      defaultPageSize={3}
                                      showPagination={false}
                                      SubComponent={(row) => {
                                        return (
                                          <div style={{padding: '20px'}}>
                                            <em>It even has access to the row data: </em>
                                            <CodeHighlight>{() => JSON.stringify(row, null, 2)}</CodeHighlight>
                                          </div>
                                        )
                                      }}
                                    />*/}
                </div>
              )
            }}
          />
        </div>
        <div style={{textAlign: 'center'}}>
          <br />
          <em>Tip: Hold shift when sorting to multi-sort!</em>
        </div>
        <CodeHighlight>{() => getCode()}</CodeHighlight>
      </div>
    )
  }
}
  `
}
