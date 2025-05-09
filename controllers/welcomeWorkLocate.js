export async function welcomeWorkLocate(req,res) {
  try{
     return res.status(201).json({ message: "Welcome to workLocate."});
  }catch(error){
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  } 
}
