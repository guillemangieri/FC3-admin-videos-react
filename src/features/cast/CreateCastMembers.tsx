import { useEffect, useState } from "react";
import { CastMember } from "../../types/CastMembers";
import { initialState, useCreateCastMemberMutation } from "./castMembersSlice";
import { useSnackbar } from "notistack";
import { Box } from "@mui/system";
import { Paper, Typography } from "@mui/material";
import { CastMemberForm } from "./components/CastMembersform";
// Permite retornar à listagem após a confirmação do cadastro.
import { useNavigate } from "react-router-dom";

export const CreateCastMember = () => {
  // Obtém a função de navegação entre as telas.
  const navigate = useNavigate();
  const [castMemberState, setCastMemberState] =
    useState<CastMember>(initialState);
  const [createCastMember, status] = useCreateCastMemberMutation();
  const { enqueueSnackbar } = useSnackbar();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setCastMemberState({ ...castMemberState, [name]: value });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await createCastMember(castMemberState);
  }

  useEffect(() => {
    if (status.isSuccess) {
      enqueueSnackbar(`Cast member created`, { variant: "success" });
      // Volta à listagem somente após o sucesso, substituindo o formulário no histórico.
      navigate("/cast-members", { replace: true });
    }
    if (status.isError) {
      enqueueSnackbar(`Cast member not created`, { variant: "error" });
    }
  // Acompanha o resultado da persistência e a função de navegação utilizada pelo efeito.
  }, [status.isSuccess, status.isError, enqueueSnackbar, navigate]);

  return (
    <Box>
      <Paper>
        <Box p={2}>
          <Box mb={2}>
            <Typography variant="h4">Create Cast Member</Typography>
          </Box>
        </Box>
        <CastMemberForm
          handleSubmit={handleSubmit}
          handleChange={handleChange}
          castMember={castMemberState}
          isLoading={status.isLoading}
          isdisabled={status.isLoading}
        />
      </Paper>
    </Box>
  );
};
