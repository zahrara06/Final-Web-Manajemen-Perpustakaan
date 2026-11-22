"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";

const BOOK_STACK = [
    {
        position: [0, -0.95, 0],
        color: "#ffc72c",
        rotation: [0, 0.2, 0],
        size: [2.2, 0.38, 1.5],
    },
    {
        position: [0.15, -0.5, 0],
        color: "#2f6bff",
        rotation: [0, -0.35, 0],
        size: [2.0, 0.34, 1.4],
    },
    {
        position: [-0.1, -0.1, 0],
        color: "#ffffff",
        rotation: [0, 0.5, 0],
        size: [1.9, 0.32, 1.3],
    },
    {
        position: [0.1, 0.3, 0],
        color: "#1d4ed8",
        rotation: [0, -0.1, 0],
        size: [1.7, 0.3, 1.2],
    },
    {
        position: [0, 0.68, 0],
        color: "#ffc72c",
        rotation: [0, 0.7, 0],
        size: [1.5, 0.28, 1.05],
    },
];

function Book({ book }) {
    const [width, thickness, depth] = book.size;

    return (
        <group position={book.position} rotation={book.rotation}>
            <mesh>
                <boxGeometry args={[width, thickness, depth]} />
                <meshStandardMaterial color={book.color} roughness={0.4} />
            </mesh>

            <mesh position={[0.06, 0, 0]}>
                <boxGeometry
                    args={[width - 0.1, thickness - 0.1, depth + 0.08]}
                />
                <meshStandardMaterial color="#f6f1dc" roughness={0.9} />
            </mesh>
        </group>
    );
}

function BookStack() {
    const group = useRef();

    useFrame((state, delta) => {
        group.current.rotation.y += delta * 0.35;

        group.current.rotation.x +=
            (state.pointer.y * 0.25 - group.current.rotation.x) * 0.05;
    });

    return (
        <group ref={group}>
            {BOOK_STACK.map((book, index) => (
                <Float
                    key={index}
                    speed={1.4 + index * 0.2}
                    rotationIntensity={0.15}
                    floatIntensity={0.5}
                >
                    <Book book={book} />
                </Float>
            ))}
        </group>
    );
}

function Sphere({ position, color, radius }) {
    return (
        <Float speed={2} floatIntensity={2.2}>
            <mesh position={position}>
                <sphereGeometry args={[radius, 32, 32]} />
                <meshStandardMaterial color={color} roughness={0.25} />
            </mesh>
        </Float>
    );
}

function Ring() {
    const ring = useRef();

    useFrame((_, delta) => {
        ring.current.rotation.x += delta * 0.4;
        ring.current.rotation.z += delta * 0.2;
    });

    return (
        <mesh ref={ring} position={[0, 0, -1]}>
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
            <pointLight
                position={[-4, -2, 2]}
                intensity={25}
                color="#ffc72c"
            />

            <BookStack />
            <Ring />

            <Sphere position={[2.4, 1.3, 0.5]} color="#ffc72c" radius={0.28} />
            <Sphere position={[-2.5, 1.0, 0.8]} color="#ffffff" radius={0.2} />
            <Sphere position={[-2.1, -1.5, 0.4]} color="#2f6bff" radius={0.34} />
            <Sphere position={[2.3, -1.3, 0.2]} color="#ffffff" radius={0.16} />
        </Canvas>
    );
}