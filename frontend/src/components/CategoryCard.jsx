import React from 'react'

function CategoryCard({name,image,onClick}) {
  return (
    <div onClick={onClick} className='group relative w-[130px] h-[130px] md:w-[170px] md:h-[170px] shrink-0 rounded-2xl overflow-hidden cursor-pointer ring-1 ring-black/[0.06] shadow-soft hover:shadow-card transition-shadow duration-300'>
     <img src={image} alt={name} className='w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500'/>
     <div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent pt-10 pb-2.5 px-3'>
       <span className='block text-center text-sm font-semibold text-white drop-shadow'>{name}</span>
     </div>
    </div>
  )
}

export default CategoryCard