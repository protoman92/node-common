Boolean.random = function(threshold) {
	return (1 - Math.random()) < parseFloat(threshold || 0.5);
};