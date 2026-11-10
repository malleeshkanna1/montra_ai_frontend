import { ArrowRight } from 'lucide-react';
import notFoundImage from '../../assets/not-found.png';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
    
    const navigate = useNavigate()
    
    return <div className="w-full lg:w-1/2 mx-auto p-6 bg-[#fff]">
        <div className="flex items-center justify-center h-screen " aria-label="not-found">
            <div>
                <img src={notFoundImage} alt="Not Found" className='w-auto h-[250px] mx-auto' />
                <h1 className="text-3xl text-center font-extrabold" >Page Not Found</h1>
                <p className="text-[#999999] text-md mt-3" >This page doesn't exist, or it may have moved somewhere else.</p>
                <div className="flex justify-center mt-3">
                    <Button onClick={()=>navigate('/')} className="w-[200px] cursor-pointer" >Go to Home <ArrowRight /></Button>   
                </div>
            </div>
        </div>
    </div>
}