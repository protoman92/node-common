const 
	baseDir = "../../..",
	sharedDir = baseDir + "/nodecommon",
	sharedHandlerDir = sharedDir + "/handlers",
	typeChecker = require(sharedHandlerDir + "/util/type.js"),
	utils = require(sharedHandlerDir + "/util/common.js");

function WordpressPost() {
	/**
	 * Unique identifier for the object.
	 * @type {String} The Post's id.
	 */
	this.id = "";

	/**
	 * The globally unique identifier for the object.
	 * @type {String} The Post's GUID.
	 */
	this.guid = "";

	/**
	 * The ID for the author of the object.
	 * @type {String} The Post's author.
	 */
	this.author = "";

	/**
	 * The terms assigned to the object in the category taxonomy.
	 * @type {Array} The Post's categories.
	 */
	this.categories = [];

	/**
	 * The content for the object.
	 * @type {String} The Post's content.
	 */
	this.content = "";

	/**
	 * The date the object was published, in the site’s timezone. The raw date
	 * is a string that we need to parse.
	 * @type {Number} The Post's date. 
	 */
	this.date = 0;

	/**
	 * The date the object was published, as GMT.
	 * @type {Number} The Post's GMT date.
	 */
	this.date_gmt = 0;

	/**
	 * The excerpt for the object.
	 * @type {String} The Post's excerpt.
	 */
	this.excerpt = "";

	/**
	 * The ID of the featured media for the object.
	 * @type {String} The Post's featured media.
	 */
	this.featured_media = "";

	/**
	 * URL to the object.
	 * @type {String} The Post's link.
	 */
	this.link = "";

	/**
	 * The date the object was last modified, in the site’s timezone.
	 * @type {Number} The Post's modified date.
	 */
	this.modified = 0;

	/**
	 * The date the object was last modified, as GMT.
	 * @type {Number} The Post's GMT modified date.
	 */
	this.modified_gmt = 0;

	/**
	 * An alphanumeric identifier for the object unique to its type.
	 * @type {String} The Post's slug.
	 */
	this.slug = "";

	/**
	 * The terms assigned to the object in the post_tag taxonomy.
	 * @type {Array} The Post's tags.
	 */
	this.tags = [];

	/**
	 * Type of Post for the object.
	 * @type {String} The Post's Type.
	 */
	this.type = "";

	/**
	 * The title for the object.
	 * @type {String} The Post's title.
	 */
	this.title = "";
};

WordpressPost.isInstance = function() {
	return typeChecker.isInstance(arguments, function(value) {
		return value instanceof WordpressPost;
	});
};

WordpressPost.prototype.setId = function(id) {
	if (id && String.isInstance(id)) {
		this.id = id;
	} else if (Number.isInstance(id)) {
		return this.setId(String(id));
	}

	return this;
};

WordpressPost.prototype.setGuid = function(id) {
	if (id && String.isInstance(id)) {
		this.guid = id;
	} else if (Number.isInstance(id)) {
		return this.setGuid(String(id));
	} else if (Object.isInstance(id)) {
		return this.setGuid(id.rendered);
	}

	return this;
};

WordpressPost.prototype.setAuthor = function(author) {
	if (author && String.isInstance(author)) {
		this.author = author;
	} else if (Number.isInstance(author)) {
		return this.setAuthor(String(author));
	}

	return this;
};

WordpressPost.prototype.setCategories = function(categories) {
	if (Array.isInstance(categories)) {
		this.categories = categories;
	}

	return this;
};

WordpressPost.prototype.setContent = function(content) {
	if (content && String.isInstance(content)) {
		this.content = content;
	} else if (Object.isInstance(content)) {
		return this.setContent(content.rendered);
	}

	return this;
};

WordpressPost.prototype.setDate = function(date) {
	if (Number.isInstance(date)) {
		this.date = date;
	} else if (String.isInstance(date)) {
		return this.setDate(Date.parse(date));
	}

	return this;
};

WordpressPost.prototype.setGmtDate = function(date) {
	if (Number.isInstance(date)) {
		this.date_gmt = date;
	} else if (String.isInstance(date)) {
		return this.setGmtDate(Date.parse(date));
	}

	return this;
};

WordpressPost.prototype.setExcerpt = function(excerpt) {
	if (excerpt && String.isInstance(excerpt)) {
		this.excerpt = excerpt;
	}

	return this;
};

WordpressPost.prototype.setFeaturedMedia = function(media) {
	if (media && String.isInstance(media)) {
		this.media = media;
	} else if (Number.isInstance(media)) {
		return this.setFeaturedMedia(String(media));
	}

	return this;
};

WordpressPost.prototype.setLink = function(link) {
	if (link && String.isInstance(link)) {
		this.link = link;
	}

	return this;
};

WordpressPost.prototype.setModifiedDate = function(date) {
	if (Number.isInstance(date)) {
		this.modified = date;
	} else if (String.isInstance(date)) {
		return this.setModifiedDate(Date.parse(date));
	}

	return this;
};

WordpressPost.prototype.setGmtModifiedDate = function(date) {
	if (Number.isInstance(date)) {
		this.modified_gmt = date;
	} else if (String.isInstance(date)) {
		return this.setGmtModifiedDate(Date.parse(date));
	}

	return this;
};

WordpressPost.prototype.setSlug = function(slug) {
	if (Number.isInstance(slug)) {
		this.slug = slug;
	}

	return this;
};

WordpressPost.prototype.setTags = function(tags) {
	if (Array.isInstance(tags)) {
		this.tags = tags;
	}

	return this;
};

WordpressPost.prototype.setType = function(type) {
	if (type && String.isInstance(type)) {
		this.type = type;
	}

	return this;
};

WordpressPost.prototype.setTitle = function(title) {
	if (title && String.isInstance(title)) {
		this.title = title;
	} else if (Object.isInstance(title)) {
		return this.setTitle(title.rendered);
	}

	return this;
};

WordpressPost.prototype.getId = function() {
	return this.id || "";
};

WordpressPost.prototype.getGuid = function() {
	return this.guid || "";
};

WordpressPost.prototype.getAuthor = function() {
	return this.author || "";
};

WordpressPost.prototype.getCategories = function() {
	return this.categories || [];
};

WordpressPost.prototype.getContent = function() {
	return this.content || "";
};

WordpressPost.prototype.getDate = function() {
	return this.date || 0;
};

WordpressPost.prototype.getGmtDate = function() {
	return this.date_gmt || 0;
};

WordpressPost.prototype.getExcerpt = function() {
	return this.excerpt || "";
};

WordpressPost.prototype.getFeaturedMedia = function() {
	return this.featured_media || "";
};

WordpressPost.prototype.getLink = function() {
	return this.link || "";
};

WordpressPost.prototype.getModifiedDate = function() {
	return this.modified || 0;
};

WordpressPost.prototype.getGmtModifiedDate = function() {
	return this.modified_gmt || 0;
};

WordpressPost.prototype.getSlug = function() {
	return this.slug || "";
};

WordpressPost.prototype.getTags = function() {
	return this.tags || [];
};

WordpressPost.prototype.getType = function() {
	return this.type || "";
};

WordpressPost.prototype.getTitle = function() {
	return this.title || "";
};

WordpressPost.prototype.toString = function() {
	return this.getId();
};

WordpressPost.prototype.json = function() {
	var json = {};
	const fields = WordpressPost.Fields;
	json[fields.ID.value] = this.getId();
	return json;
};

WordpressPost.prototype.hasAllRequiredInformation = function() {
	switch (true) {
		case this.getId().isEmpty():
		case this.getGuid().isEmpty():
			Error.debugException(this);
			return false;

		default:
			break;
	}

	return true;
};

WordpressPost.Builder = function() {
	var post = new WordpressPost();

	return {
		withId : function(id) {
			post.setId(id);
			return this;
		},

		withGuid : function(id) {
			post.setGuid(id);
			return this;
		},

		withAuthor : function(author) {
			post.setAuthor(author);
			return this;
		},

		withCategories : function(categories) {
			post.setCategories(categories);
			return this;
		},

		withContent : function(content) {
			post.setContent(content);
			return this;
		},

		withDate : function(date) {
			post.setDate(date);
			return this;
		},

		withGmtDate : function(date) {
			post.setGmtDate(date);
			return this;
		},

		withExcerpt : function(excerpt) {
			post.setExcerpt(excerpt);
			return this;
		},

		withFeaturedMedia : function(media) {
			post.setFeaturedMedia(media);
			return this;
		},

		withLink : function(link) {
			post.setLink(link);
			return this;
		},

		withModifiedDate : function(date) {
			post.setModifiedDate(date);
			return this;
		},

		withGmtModifiedDate : function(date) {
			post.setGmtModifiedDate(date);
			return this;
		},

		withSlug : function(slug) {
			post.setSlug(slug);
			return this;
		},

		withTags : function(tags) {
			post.setTags(tags);
			return this;
		},

		withType : function(type) {
			post.setType(type);
			return this;
		},

		withTitle : function(title) {
			post.setTitle(title);
			return this;
		},

		withPostData : function(data) {
			if (data) {
				const fields = WordpressPost.Fields;

				return this
					.withId(data[fields.ID.value])
					.withGuid(data[fields.GUID.value])
					.withAuthor(data[fields.AUTHOR.value])
					.withCategories(data[fields.CATEGORIES.value])
					.withContent(data[fields.CONTENT.value])
					.withDate(data[fields.DATE.value])
					.withGmtDate(data[fields.DATE_GMT.value])
					.withExcerpt(data[fields.EXCERPT.value])
					.withFeaturedMedia(data[fields.FEATURED_MEDIA.value])
					.withLink(data[fields.LINK.value])
					.withModifiedDate(data[fields.MODIFIED.value])
					.withGmtModifiedDate(data[fields.MODIFIED_GMT.value])
					.withSlug(data[fields.SLUG.value])
					.withTags(data[fields.TAGS.value])
					.withType(data[fields.TYPE.value])
					.withTitle(data[fields.TITLE.value]);
			} else {
				return this;
			}
		},

		build : function() {
			return post;
		}
	};
};

WordpressPost.newBuilder = function() {
	return WordpressPost.Builder();
};

WordpressPost.BLANK = new WordpressPost();

WordpressPost.Fields = {
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

	GUID : {
		value : "guid"
	},

	AUTHOR : {
		value : "author"
	},

	CATEGORIES : {
		value : "categories"
	},

	CONTENT : {
		value : "content"
	},

	DATE : {
		value : "date"
	},

	DATE_GMT : {
		value : "date_gmt"
	},

	EXCERPT : {
		value : "excerpt"
	},

	FEATURED_MEDIA : {
		value : "featured_media"
	},

	LINK : {
		value : "link"
	},

	MODIFIED : {
		value : "modified"
	},

	MODIFIED_GMT : {
		value : "modified_gmt"
	},

	SLUG : {
		value : "slug"
	},

	TAGS : {
		value : "tags"
	},

	TITLE : {
		value : "title"
	},

	TYPE : {
		value : "type"
	}
};

module.exports = WordpressPost;