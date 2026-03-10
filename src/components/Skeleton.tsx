const Skeleton = () => {
  return (
    <div className='w-full flex'>
      <div className='grid w-full gap-2'>
        <p className='capitalize p-4 bg-gray-200 animate-pulse rounded-md'></p>
        <p className='capitalize p-4 bg-gray-200 animate-pulse rounded-md'></p>
        <p className='capitalize p-4 bg-gray-200 animate-pulse rounded-md'></p>
        <p className='capitalize p-4 bg-gray-200 animate-pulse rounded-md'></p>
        <p className='capitalize p-4 bg-gray-200 animate-pulse rounded-md'></p>
        <p className='capitalize p-4 bg-gray-200 animate-pulse rounded-md'></p>
      </div>
    </div>
  )
}

export default Skeleton