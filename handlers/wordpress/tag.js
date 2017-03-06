function WordpressTag() {
	/**
	 * Unique identifier for the term.
	 * @type {String} The Tag's id. 
	 */
	this.id = "";

	/**
	 * Number of published posts for the term.
	 * @type {Number} The Tag's post count.
	 */
	this.count = 0;

	/**
	 * HTML title for the term.
	 * @type {String} The Tag's name.
	 */
	this.name = "";
};

WordpressTag.prototype.setId = function(id) {
	if (id && String.isInstance(id)) {
		this.id = id;
	} else if (Number.isInstance(id)) {
		return this.setId(String(id));
	}

	return this;
};

WordpressTag.prototype.setCount = function(count) {
	this.count = parseInt(count);
	return this;
};

WordpressTag.prototype.setName = function(name) {
	if (name && String.isInstance(name)) {
		this.name = name;
	}

	return this;
};

WordpressTag.prototype.getId = function() {
	return this.id || "";
};

WordpressTag.prototype.getCount = function() {
	return this.count || 0;
};

WordpressTag.prototype.getName = function() {
	return this.name || "";
};

WordpressTag.prototype.hasAllRequiredInformation = function() {
	switch (true) {
		case this.getId().isEmpty():
		case this.getName().isEmpty():
			Error.debugException(this);
			return false;

		default:
			break;
	}

	return true;
};

WordpressTag.Builder = function() {
	var tag = new WordpressTag();

	return {
		withId : function(id) {
			tag.setId(id);
			return this;
		},

		withCount : function(count) {
			tag.setCount(count);
			return this;
		},

		withName : function(name) {
			tag.setName(name);
			return this;
		},

		withTagData : function(data) {
			if (data) {
				const fields = WordpressTag.Fields;

				return this
					.withId(data[fields.ID.value])
					.withName(data[fields.NAME.value])
					.withCount(data[fields.COUNT.value]);
			} else {
				return this;
			}
		},

		build : function() {
			return tag;
		}
	};
};

WordpressTag.newBuilder = function() {
	return WordpressTag.Builder();
};

WordpressTag.Fields = {
	allFields : function() {
		const instance = this, keys = utils.getKeys(instance);
		return keys.map(key => instance[key]).filter(field => field.value);
	},

	allFieldValues : function() {
		return this.allFields().map(field => field.value);
	},

	fromValues : function(values) {
		const fields = this.allFields();

		if (Array.isInstance(values)) {
			return values
				.map(value => fields.filter(field => field.value == value)[0])
				.filter(field => field);
		}

		Error.debugException(values);
		return [];
	},

	ID : {
		value : "id"
	},

	COUNT : {
		value : "count"
	},

	NAME : {
		value : "name"
	}
};

module.exports = WordpressTag;