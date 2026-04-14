import Subcategory from '../models/Subcategory.js';

// @desc    Get all subcategories
// @route   GET /api/subcategories
// @access  Public
export const getSubcategories = async (req, res) => {
  const subcategories = await Subcategory.find({});
  res.json(subcategories);
};

// @desc    Create a subcategory
// @route   POST /api/subcategories
// @access  Private/Admin
export const createSubcategory = async (req, res) => {
  const { name } = req.body;

  const subcategoryExists = await Subcategory.findOne({ name });

  if (subcategoryExists) {
    res.status(400);
    throw new Error('Subcategory already exists');
  }

  const subcategory = await Subcategory.create({ name });

  if (subcategory) {
    res.status(201).json(subcategory);
  } else {
    res.status(400);
    throw new Error('Invalid subcategory data');
  }
};

// @desc    Update a subcategory
// @route   PUT /api/subcategories/:id
// @access  Private/Admin
export const updateSubcategory = async (req, res) => {
  const { name } = req.body;

  const subcategory = await Subcategory.findById(req.params.id);

  if (subcategory) {
    subcategory.name = name;
    const updatedSubcategory = await subcategory.save();
    res.json(updatedSubcategory);
  } else {
    res.status(404);
    throw new Error('Subcategory not found');
  }
};

// @desc    Delete a subcategory
// @route   DELETE /api/subcategories/:id
// @access  Private/Admin
export const deleteSubcategory = async (req, res) => {
  const subcategory = await Subcategory.findById(req.params.id);

  if (subcategory) {
    await subcategory.deleteOne();
    res.json({ message: 'Subcategory removed' });
  } else {
    res.status(404);
    throw new Error('Subcategory not found');
  }
};
