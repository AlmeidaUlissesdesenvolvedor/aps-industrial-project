import api from './api';

export interface Machine {
  id: number;
  code: string;
  name: string;
  status: number;
  capacity: number;
}

export interface MachineFormData {
  code: string;
  name: string;
  status: number;
  capacity: number;
}

export const getMachines = async (): Promise<Machine[]> => {
  const response = await api.get('/machines');
  return response.data;
};

export const getMachineById = async (
  id: number
): Promise<Machine> => {
  const response = await api.get(`/machines/${id}`);
  return response.data;
};

export const createMachine = async (
  data: MachineFormData
): Promise<Machine> => {
  const response = await api.post('/machines', {
    id: 0,
    ...data,
  });

  return response.data;
};

export const updateMachine = async (
  id: number,
  data: MachineFormData
): Promise<void> => {
  await api.put(`/machines/${id}`, {
    id,
    ...data,
  });
};

export const deleteMachine = async (
  id: number
): Promise<void> => {
  await api.delete(`/machines/${id}`);
};