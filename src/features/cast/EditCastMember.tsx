import { useEffect, useState } from "react";
import { CastMember } from "../../types/CastMembers";
import {
  initialState,
  useGetCastMemberQuery,
  useUpdateCastMemberMutation,
} from "./castMembersSlice";
import { useSnackbar } from "notistack";
import { Box } from "@mui/system";
import { Paper, Typography } from "@mui/material";
import { CastMemberForm } from "./components/CastMembersform";
// Permite retornar à listagem após a confirmação da edição.
import { useNavigate, useParams } from "react-router-dom";

export const EditCastMember = () => {
  // Obtém a função de navegação entre as telas.
  const navigate = useNavigate();
  const id = useParams().id ?? "";
  const { data: castMember, isFetching } = useGetCastMemberQuery({ id });
  const [castMemberState, setCastMemberState] =
    useState<CastMember>(initialState);

  const [updateCastMember, status] = useUpdateCastMemberMutation();

  const { enqueueSnackbar } = useSnackbar();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setCastMemberState({ ...castMemberState, [name]: value });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await updateCastMember(castMemberState);
  }

  useEffect(() => {
    if (castMember) {
      setCastMemberState(castMember.data);
    }
  }, [castMember]);

  useEffect(() => {
    if (status.isSuccess) {
      enqueueSnackbar(`Cast member updated`, { variant: "success" });
      // Volta à listagem somente após o sucesso, substituindo a edição no histórico.
      navigate("/cast-members", { replace: true });
    }
    if (status.isError) {
      enqueueSnackbar(`Cast member not updated`, { variant: "error" });
    }
  // Acompanha o resultado da persistência e a função de navegação utilizada pelo efeito.
  }, [status.isSuccess, status.isError, enqueueSnackbar, navigate]);

  return (
    <Box>
      <Paper>
        <Box p={2}>
          <Box mb={2}>
            <Typography variant="h4">Edit Cast member</Typography>
          </Box>
        </Box>
        <CastMemberForm
          handleSubmit={handleSubmit}
          handleChange={handleChange}
          castMember={castMemberState}
          isLoading={isFetching || status.isLoading}
          isdisabled={status.isLoading}
        />
      </Paper>
    </Box>
  );
};
