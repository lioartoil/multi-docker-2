import React, { Component } from 'react';
import axios from 'axios';

class Fib extends Component {
	state = { seenIndices: [], values: {}, index: '' };

	componentDidMount() {
		this.fetchValues();
		this.fetchIndices();
	}

	async fetchValues() {
		const values = await axios.get('/api/values/current');
		if (values && values.data) this.setState({ values: values.data });
	}

	async fetchIndices() {
		const values = await axios.get('/api/values/all');
		if (values && values.data) this.setState({ seenIndices: values.data });
	}

	handleSubmit = async event => {
		event.preventDefault();

		await axios.post('/api/values', { index: this.state.index });
		this.setState({ index: '' });
	};

	renderSeenIndices() {
		return this.state.seenIndices.map(({ number }) => number).join(', ');
	}

	renderValues() {
		const entries = [];

		for (let key in this.state.values) {
			entries.push(
				<div key={key}>
					For index {key} I calculated {this.state.values[key]}
				</div>
			);
		}

		return entries;
	}

	render() {
		return (
			<div>
				<form onSubmit={this.handleSubmit}>
					<label>Enter your index:</label>
					<input
						value={this.state.index}
						onChange={({ target: { value: index } }) =>
							this.setState({ index })
						}
					/>
					<button>Submit</button>
				</form>

				<h3>Indices I have seen:</h3>
				{this.renderSeenIndices()}

				<h3>Calculated values:</h3>
				{this.renderValues()}
			</div>
		);
	}
}

export default Fib;
