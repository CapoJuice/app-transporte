"use client";
import AlertBox, { Alert, AlertType } from "@/app/components/alert-box";
import Container from "@/app/components/container";
import Card from "@/app/components/card";
import Modal from "@/app/components/modal";
import Form from "@/app/components/form";
import Fieldset from "@/app/components/fieldset";
import React, { useEffect, useState } from "react";

type Frete = {
  num_conhecimento?: number;
  data_frete?: string;
  created_at?: string;
  updated_at?: string;
};

export default function Frete() {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [fretes, setFretes] = useState<Frete[]>([]);
  const [frete, setFrete] = useState<Frete>();
  const [alert, setAlert] = useState<Alert>({
    message: "",
    alert_type: AlertType.SUCCESS,
    emitted_at: new Date(),
  });

  useEffect(() => {
    getAll();
  }, []);

  function getAll(): void {
    fetch(${process.env.NEXT_PUBLIC_BACKEND_URL}/frete)
      .then(async (res) => {
        if (res.ok) {
          setFretes(await res.json());
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }

  function create(): void {
    if (frete?.created_at) {
      update();
      return;
    }

    fetch(${process.env.NEXT_PUBLIC_BACKEND_URL}/frete, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(frete),
    })
      .then(async (res) => {
        if (res.ok) {
          setAlert({
            message: "Frete criado com sucesso",
            alert_type: AlertType.SUCCESS,
            emitted_at: new Date(),
          });
          fretes.push(await res.json());
          setFretes([...fretes]);
          setShowModal(false);
        } else {
          const json = await res.json();
          setAlert({
            message:
              typeof json.message === "string"
                ? json.message
                : json.message.toString(),
            alert_type: AlertType.ERROR,
            emitted_at: new Date(),
          });
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }

  function update() {
    fetch(
      ${process.env.NEXT_PUBLIC_BACKEND_URL}/frete/${frete?.num_conhecimento},
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(frete),
      }
    )
      .then(async (res) => {
        if (res.ok) {
          setAlert({
            message: "Frete atualizado com sucesso",
            alert_type: AlertType.SUCCESS,
            emitted_at: new Date(),
          });
          const updatedFrete = await res.json();
          const index = fretes.findIndex(
            (f) => f.num_conhecimento === updatedFrete.num_conhecimento
          );
          fretes[index] = updatedFrete;
          setFretes([...fretes]);
          setShowModal(false);
        } else {
          const json = await res.json();
          setAlert({
            message:
              typeof json.message === "string"
                ? json.message
                : json.message.toString(),
            alert_type: AlertType.ERROR,
            emitted_at: new Date(),
          });
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }

  function remove(frete: Frete) {
    fetch(
      ${process.env.NEXT_PUBLIC_BACKEND_URL}/frete/${frete?.num_conhecimento},
      {
        method: "DELETE",
      }
    )
      .then(async (res) => {
        if (res.ok) {
          setAlert({
            message: "Frete removido com sucesso",
            alert_type: AlertType.SUCCESS,
            emitted_at: new Date(),
          });
          const deletedFrete = await res.json();
          setFretes(
            fretes.filter(
              (f) => f.num_conhecimento !== deletedFrete.num_conhecimento
            )
          );
        } else {
          const json = await res.json();
          setAlert({
            message:
              typeof json.message === "string"
                ? json.message
                : json.message.toString(),
            alert_type: AlertType.ERROR,
            emitted_at: new Date(),
          });
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }

  function handleInput(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFrete((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function openModal(frete: Frete) {
    setFrete(frete);
    setShowModal(true);
  }

  return (
    <>
      <Container
        header={"Frete"}
        onNew={() => {
          openModal({});
        }}
      >
        {fretes.map((frete) => (
          <Card key={frete.num_conhecimento}>
            <div className={"flex flex-row justify-between"}>
              <div
                className={"w-full"}
                onClick={() => {
                  openModal(frete);
                }}
              >
                <p>Número do Conhecimento: {frete.num_conhecimento}</p>
                <p>Data do Frete: {frete.data_frete}</p>
              </div>
              <button
                className={"text-red-400"}
                onClick={() => {
                  remove(frete);
                }}
              >
                Excluir
              </button>
            </div>
          </Card>
        ))}
      </Container>
      {showModal && (
        <Modal
          header={"Criar/Editar Frete"}
          onCancel={() => {
            setShowModal(false);
          }}
          onOk={() => {
            create();
          }}
        >
          <Form>
            <Fieldset>
              <label>Data do Frete</label>
              <input
                name={"data_frete"}
                type="date"
                defaultValue={frete?.data_frete?.split("T")[0]}
                onInput={handleInput}
                required
              ></input>
            </Fieldset>
          </Form>
        </Modal>
      )}
      <AlertBox alert={alert}></AlertBox>
    </>
  );
}