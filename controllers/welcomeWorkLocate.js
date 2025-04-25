export async function welcomeWorkLocate(req,res) {
  try{
     return res.status(201).json({success: true , message: "Welcome to workLocate."});
  }catch(err){
    console.error('Error in createWorkingSpace:', err.message || err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  } 
}
