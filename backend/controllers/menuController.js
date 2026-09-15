import Menu from '../models/Menu.js';

// @desc    Get full weekly menu
// @route   GET /api/menus
// @access  Public
export const getMenus = async (req, res) => {
  try {
    const menus = await Menu.find().populate('updatedBy', 'name').sort({ day: 1 });

    // Organize by day
    const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const mealOrder = ['breakfast', 'lunch', 'snacks', 'dinner'];

    const organized = {};
    dayOrder.forEach(day => {
      organized[day] = {};
      mealOrder.forEach(meal => {
        const menuItem = menus.find(m => m.day === day && m.mealType === meal);
        organized[day][meal] = menuItem || null;
      });
    });

    res.status(200).json({
      success: true,
      count: menus.length,
      menus,
      organized
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get today's menu
// @route   GET /api/menus/today
// @access  Public
export const getTodayMenu = async (req, res) => {
  try {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];

    const menus = await Menu.find({ day: today }).populate('updatedBy', 'name');

    // Sort by meal order
    const mealOrder = ['breakfast', 'lunch', 'snacks', 'dinner'];
    menus.sort((a, b) => mealOrder.indexOf(a.mealType) - mealOrder.indexOf(b.mealType));

    res.status(200).json({
      success: true,
      day: today,
      menus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create a menu entry
// @route   POST /api/menus
// @access  Worker/Admin
export const createMenu = async (req, res) => {
  try {
    const { day, mealType, items, price } = req.body;

    // Check if menu entry already exists for this day + mealType
    const existing = await Menu.findOne({ day: day.toLowerCase(), mealType: mealType.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Menu for ${day} ${mealType} already exists. Use PUT to update.`
      });
    }

    const menu = await Menu.create({
      day: day.toLowerCase(),
      mealType: mealType.toLowerCase(),
      items,
      price,
      updatedBy: req.user._id
    });

    res.status(201).json({
      success: true,
      menu
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update a menu entry
// @route   PUT /api/menus/:id
// @access  Worker/Admin
export const updateMenu = async (req, res) => {
  try {
    const { items, price } = req.body;

    const menu = await Menu.findById(req.params.id);
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu entry not found'
      });
    }

    if (items) menu.items = items;
    if (price !== undefined) menu.price = price;
    menu.updatedBy = req.user._id;

    await menu.save();

    res.status(200).json({
      success: true,
      menu
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete a menu entry
// @route   DELETE /api/menus/:id
// @access  Admin
export const deleteMenu = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu entry not found'
      });
    }

    await menu.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Menu entry deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
