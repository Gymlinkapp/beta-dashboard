import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { User } from './types/user';
import { PencilSimple, X } from '@phosphor-icons/react';

function App() {
  const queryClient = useQueryClient();
  const [users, setUsers] = useState<User[]>([]);
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
    <div className='App max-w-lg mx-auto my-12'>
      <ul className='flex flex-col gap-2'>
        <div className='flex gap-2'>
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
        </div>
        {users.map((user: User) => (
          <li
            key={user.id}
            className='bg-white p-4 rounded-md flex justify-between items-center'
          >
            <div>
              {user.password && (
                <p className='px-4 py-1 mb-2 text-xs bg-black rounded-full text-white w-fit'>
                  Bot
                </p>
              )}
              <h1>{user.firstName}</h1>
              <p>{user.email}</p>
            </div>
            <div className='h-full flex gap-2'>
              <button
                className='bg-slate-300 text-white p-2 rounded-full'
                onClick={() => deleteUser.mutate(user.id)}
              >
                <PencilSimple size={32} />
              </button>
              <button
                className='bg-red-300 text-white p-2 rounded-full'
                onClick={() => deleteUser.mutate(user.id)}
              >
                <X size={32} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
