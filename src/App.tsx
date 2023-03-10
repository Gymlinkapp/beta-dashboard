import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { User } from './types/user';
import { PencilSimple, Rows, SquaresFour, X } from '@phosphor-icons/react';

function App() {
  const queryClient = useQueryClient();
  const [users, setUsers] = useState<User[]>([]);
  const [isGrid, setIsGrid] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // new user's info
  const [firstName, setFirstName] = useState<string>(
    currentUser?.firstName || ''
  );
  const [lastName, setLastName] = useState<string>(currentUser?.lastName || '');
  const [bio, setBio] = useState<string>(currentUser?.bio || '');
  const { isLoading, error, data } = useQuery('users', () =>
    fetch('https://gymlink-service.onrender.com/allUsers').then((res) =>
      res.json()
    )
  );

  useEffect(() => {
    if (data) setUsers(data);
  }, [data]);

  const deleteUser = useMutation(
    (id: string) =>
      fetch(`https://gymlink-service.onrender.com/dashboardUserDelete/${id}`, {
        method: 'DELETE',
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');

        alert('User deleted successfully');
      },
    }
  );

  const updateUser = useMutation(
    (id: string) =>
      fetch(`https://gymlink-service.onrender.com/dashboardEditUser/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          bio,
        }),
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
      },
    }
  );

  if (isLoading) return <p>Loading...</p>;

  if (error) return <p>Error</p>;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const filteredUsers = data.filter((user: User) => {
      return user.firstName.toLowerCase().includes(value.toLowerCase());
    });

    setUsers(filteredUsers);
  };

  const filterUsers = (filterType: string) => {
    if (filterType === 'all') {
      setUsers(data);
    } else if (filterType === 'user') {
      const filteredUsers = data.filter((user: User) => {
        return user.password === null;
      });

      setUsers(filteredUsers);
    } else if (filterType === 'bot') {
      const filteredUsers = data.filter((user: User) => {
        return user.password !== null;
      });

      setUsers(filteredUsers);
    }
  };
  return (
    <div className='relative min-h-[95vh]'>
      {isModalOpen && (
        <div className='absolute inset-0 bg-black/75 grid place-items-center'>
          <div className='bg-white rounded-md flex flex-col px-4'>
            <div className='flex justify-between items-center pb-6 py-2'>
              <h3 className='font-bold text-xl'>Edit User</h3>
              <button
                className='text-black p-2 rounded-full cursor-pointer'
                onClick={() => setIsModalOpen(false)}
              >
                <X size={24} />
              </button>
            </div>
            <div className='flex flex-col'>
              <div>
                <div className='overflow-hidden rounded-full w-20 h-20 mb-4'>
                  <img
                    src={currentUser?.images[0]}
                    className='h-full w-full object-cover'
                  />
                </div>
                <div className='flex gap-2 items-center'>
                  <input
                    type='text'
                    className='bg-slate-100 rounded-md p-1 text-black'
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                    }}
                  />
                  <input
                    type='text'
                    className='bg-slate-100 rounded-md p-1 text-black'
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                    }}
                  />
                </div>
                <p className='text-md text-gray-400 font-medium'>
                  {currentUser?.age}
                </p>
                <p className='text-md text-gray-400 font-medium'>
                  {currentUser?.email}
                </p>
                <div className='mt-4 '>
                  <h4 className='text-md text-gray-500 font-medium'>Bio</h4>
                  <textarea
                    className='bg-slate-100 rounded-md p-2 text-black w-full h-32 text-sm'
                    onChange={(e) => {
                      setBio(e.target.value);
                    }}
                  >
                    {currentUser?.bio}
                  </textarea>
                </div>
              </div>

              <button
                className='bg-black text-white rounded-md mt-12 mb-2 py-2'
                onClick={() => {
                  updateUser.mutate(currentUser?.id as string);
                  setIsModalOpen(false);
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
      <div className={`App ${isGrid ? 'max-w-5xl' : 'max-w-2xl'} mx-auto`}>
        <div className='flex gap-2 py-4'>
          <input
            type='text'
            placeholder='Search'
            className='bg-white flex-1 p-2 rounded-md'
            onChange={handleSearch}
          />
          <select className='bg-white p-2 rounded-md'>
            <option value='all' onClick={() => filterUsers('all')}>
              All
            </option>
            <option value='user' onClick={() => filterUsers('user')}>
              User
            </option>
            <option value='bot' onClick={() => filterUsers('bot')}>
              Bot
            </option>
          </select>
          <button
            className='bg-white p-2 rounded-md'
            onClick={() => setIsGrid(!isGrid)}
          >
            {isGrid ? <SquaresFour size={32} /> : <Rows size={32} />}
          </button>
        </div>
        <div className='grid grid-cols-3 gap-4 mb-4 '>
          <div className='bg-white p-6 rounded-md'>
            <h1 className='text-2xl'>Users</h1>
            <p className='text-gray-500'>{users.length} users</p>
          </div>
          <div className='bg-white p-6 rounded-md'>
            <h1 className='text-2xl'>Online</h1>
            <p className='text-gray-500'>{users.length} users</p>
          </div>
          <div className='bg-white p-6 rounded-md'>
            <h1 className='text-2xl'>Users</h1>
            <p className='text-gray-500'>{users.length} users</p>
          </div>
        </div>
        <ul
          className={`${isGrid ? 'grid grid-cols-3' : 'flex flex-col'} gap-2`}
        >
          {users.map((user: User) => (
            <li
              key={user.id}
              className={`bg-white p-4 rounded-md flex justify-between ${
                isGrid ? 'items-start' : 'items-center'
              }`}
            >
              <div>
                {user.password && (
                  <p className='px-4 py-1 mb-2 text-xs bg-black rounded-full text-white w-fit'>
                    Bot
                  </p>
                )}
                <div className='flex items-center gap-2'>
                  <div className='overflow-hidden rounded-full w-12 h-12'>
                    <img
                      src={user.images[0]}
                      className='h-full w-full object-cover'
                    />
                  </div>
                  <div>
                    <h1>{user.firstName}</h1>
                    <p>{user.email}</p>
                  </div>
                </div>
              </div>
              <div className='flex gap-2'>
                <button
                  className='bg-slate-900 text-white p-2 rounded-full'
                  onClick={() => {
                    setCurrentUser(user);
                    setFirstName(user.firstName);
                    setLastName(user.lastName);
                    setBio(user.bio ? user.bio : '');
                    setIsModalOpen(true);
                  }}
                >
                  <PencilSimple size={isGrid ? 16 : 32} />
                </button>
                <button
                  className='bg-red-300 text-white p-2 rounded-full'
                  onClick={() => deleteUser.mutate(user.id)}
                >
                  <X size={isGrid ? 16 : 32} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
