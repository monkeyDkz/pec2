const express = require('express');
const router = express.Router();

// Route de test simple pour créer une opération
router.post('/', async (req, res) => {
  try {
    console.log('✅ POST /api/operations called');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    
    // Vérifier l'authentification PSP
    const pspSecret = req.headers['x-psp-secret'];
    if (pspSecret !== (process.env.PSP_SECRET || 'psp-secret-key-2024')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized PSP access'
      });
    }

    res.json({
      success: true,
      message: 'Operation creation endpoint working',
      received_data: req.body
    });

  } catch (error) {
    console.error('❌ Error in operation creation:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
