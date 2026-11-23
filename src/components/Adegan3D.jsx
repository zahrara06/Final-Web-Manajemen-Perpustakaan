"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";

const TUMPUKAN_BUKU = [
    { posisi: [0, -0.95, 0], warna: "#ffc72c", putaran: [0, 0.2, 0], ukuran: [2.2, 0.38, 1.5] },
    { posisi: [0.15, -0.5, 0], warna: "#2f6bff", putaran: [0, -0.35, 0], ukuran: [2.0, 0.34, 1.4] },
    { posisi: [-0.1, -0.1, 0], warna: "#ffffff", putaran: [0, 0.5, 0], ukuran: [1.9, 0.32, 1.3] },
    { posisi: [0.1, 0.3, 0], warna: "#1d4ed8", putaran: [0, -0.1, 0], ukuran: [1.7, 0.3, 1.2] },
    { posisi: [0, 0.68, 0], warna: "#ffc72c", putaran: [0, 0.7, 0], ukuran: [1.5, 0.28, 1.05] },
];

function Buku({ buku }) {
    const [panjang, tebal, lebar] = buku.ukuran;
    return (
        <group position={buku.posisi} rotation={buku.putaran}>
        <mesh>
            <boxGeometry args={[panjang, tebal, lebar]} />
            <meshStandardMaterial color={buku.warna} roughness={0.4} />
        </mesh>
        {/* Lembar halaman yang sedikit menonjol di sisi depan dan belakang */}
        <mesh position={[0.06, 0, 0]}>
            <boxGeometry args={[panjang - 0.1, tebal - 0.1, lebar + 0.08]} />
            <meshStandardMaterial color="#f6f1dc" roughness={0.9} />
        </mesh>
        </group>
    );
}

function Tumpukan() {
    const kelompok = useRef();
    useFrame((keadaan, selang) => {
        kelompok.current.rotation.y += selang * 0.35;
        // Tumpukan sedikit miring mengikuti arah kursor
        kelompok.current.rotation.x += (keadaan.pointer.y * 0.25 - kelompok.current.rotation.x) * 0.05;
    });
    return (
        <group ref={kelompok}>
        {TUMPUKAN_BUKU.map((buku, i) => (
            <Float key={i} speed={1.4 + i * 0.2} rotationIntensity={0.15} floatIntensity={0.5}>
            <Buku buku={buku} />
            </Float>
        ))}
        </group>
    );
}

function Bola({ posisi, warna, jari }) {
    return (
        <Float speed={2} floatIntensity={2.2}>
        <mesh position={posisi}>
            <sphereGeometry args={[jari, 32, 32]} />
            <meshStandardMaterial color={warna} roughness={0.25} />
        </mesh>
        </Float>
    );
}

function Cincin() {
    const cincin = useRef();
    useFrame((_, selang) => {
        cincin.current.rotation.x += selang * 0.4;
        cincin.current.rotation.z += selang * 0.2;
    });
    return (
        <mesh ref={cincin} position={[0, 0, -1]}>
        <torusGeometry args={[2.6, 0.04, 16, 100]} />
        <meshStandardMaterial color="#ffc72c" />
        </mesh>
    );
}

export default function Adegan3D() {
    return (
        <Canvas camera={{ position: [0, 0.4, 6.8], fov: 42 }} dpr={[1, 2]}>
            <ambientLight intensity={0.9} />
            <directionalLight position={[4, 5, 3]} intensity={2.2} />
            <pointLight position={[-4, -2, 2]} intensity={25} color="#ffc72c" />
            <Tumpukan />
            <Cincin />
            <Bola posisi={[2.4, 1.3, 0.5]} warna="#ffc72c" jari={0.28} />
            <Bola posisi={[-2.5, 1.0, 0.8]} warna="#ffffff" jari={0.2} />
            <Bola posisi={[-2.1, -1.5, 0.4]} warna="#2f6bff" jari={0.34} />
            <Bola posisi={[2.3, -1.3, 0.2]} warna="#ffffff" jari={0.16} />
        </Canvas>
    );
}
